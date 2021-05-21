const { celebrate, Joi } = require('celebrate');
const userRouter = require('express').Router();

const {
  aboutMe,
  updateMe,
} = require('../controllers/users');

userRouter.get('/users/me', aboutMe);
userRouter.patch('/users/me', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    name: Joi.string().min(2).max(30).required(),
  }),
}), updateMe);

module.exports = userRouter;
