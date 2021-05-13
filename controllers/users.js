const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const NotFoundError = require('../errors/not-found-err');
const ServerError = require('../errors/server-err');
const ValidationError = require('../errors/validation-err');
const ConflictError = require('../errors/conflict-err');
const AuthError = require('../errors/auth-error.js');

const User = require('../models/user');

const { JWT_SECRET, NODE_ENV } = process.env;

const createUser = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;

  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        bcrypt.hash(password, 10)
          .then((hash) => {
            User.create({
              name,
              email,
              password: hash,
            })
              .then((user) => {
                if (!user) throw new ServerError();
                res.status(200).send({
                  data: {
                    name: user.name,
                    email: user.email,
                  },
                });
              })
              .catch((err) => {
                if (err.name === 'ValidationError') throw new ValidationError('Неправильно введены данные');
              });
          });
      } else throw new ConflictError('Данный email уже занят');
    }).catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new AuthError('Неправильные почта или пароль');
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) throw new AuthError('Неправильные почта или пароль');
          return user;
        });
    })
    .then(({ _id }) => {
      const token = jwt.sign({ _id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '1d' });
      res.status(200).send({ data: token });
    })
    .catch(next);
};

const aboutMe = (req, res, next) => {
  const { _id } = req.user;

  User.findOne({ _id })
    .then((user) => {
      if (!user) throw new NotFoundError('Нет пользователя с таким id');
      res.status(200).send({ data: user });
    })
    .catch(next);
};

const updateMe = (req, res, next) => {
  const { _id } = req.user;

  User.updateOne({ _id }, { $set: { name: req.body.name, email: req.body.email } })
    .then((data) => {
      if (!data.ok) throw new NotFoundError('Нет пользователя с таким id');
      User.findById({ _id }).then((user) => res.status(200).send({ data: user }));
    })
    .catch(next);
};

module.exports = {
  createUser,
  login,
  aboutMe,
  updateMe,
};
