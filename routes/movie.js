const { celebrate, Joi } = require('celebrate');
const validator = require('validator');
const moviesRouter = require('express').Router();
const ValidationError = require('../errors/validation-err');

const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movie');

moviesRouter.get('/movies', getMovies);
moviesRouter.post('/movies', celebrate({
  body: Joi.object().keys({
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
    thumbnail: Joi.string().custom((value) => {
      if (validator.isURL(value, { require_protocol: true })) return value;
      throw ValidationError('Неправильно введены данные');
    }, 'url-validation'),
    trailer: Joi.string().custom((value) => {
      if (validator.isURL(value, { require_protocol: true })) return value;
      throw ValidationError('Неправильно введены данные');
    }, 'url-validation'),
    image: Joi.string().custom((value) => {
      if (validator.isURL(value, { require_protocol: true })) return value;
      throw ValidationError('Неправильно введены данные');
    }, 'url-validation'),
    description: Joi.string().required(),
    year: Joi.string().required(),
    duration: Joi.number().required(),
    director: Joi.string().required(),
    country: Joi.string().required(),
    movieId: Joi.number().required(),
  }),
}), createMovie);
moviesRouter.delete('/movie/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().hex().length(24).required(),
  }),
}), deleteMovie);

module.exports = moviesRouter;
