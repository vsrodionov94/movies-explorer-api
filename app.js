const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { errors, celebrate, Joi } = require('celebrate');
const bodyParser = require('body-parser');
const validator = require('validator');
const userRouter = require('./routes/users.js');
const moviesRouter = require('./routes/movie.js');
const { login, createUser } = require('./controllers/users.js');
const auth = require('./middlewares/auth.js');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const NotFoundError = require('./errors/not-found-err.js');
const ServerError = require('./errors/server-err.js');
const ValidationError = require('./errors/validation-err.js');
require('dotenv').config();

const { PORT = process.env.NODE_ENV === 'production' ? process.env.PORT : 3000 } = process.env;

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().custom((value) => {
      if (validator.isURL(value, { require_protocol: true })) return value;
      throw ValidationError('Неправильно введены данные');
    }, 'url-validation'),
  }),
}), createUser);
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
}), login);

app.use(auth);

app.use('/', userRouter);
app.use('/', moviesRouter);

app.all('*', () => {
  throw new NotFoundError('Запрашиваемый ресурс не найден');
});

app.use(errors());
app.use(() => {
  throw new ServerError();
});

app.use(errorLogger);

app.use((error, req, res, next) => {
  res.status(error.statusCode || 500);
  res.json({ message: error.message });
  next();
});

app.listen(PORT);
