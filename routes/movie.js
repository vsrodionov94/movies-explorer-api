const { celebrate, Joi } = require('celebrate');
const validator = require('validator');
const moviesRouter = require('express').Router();
const ValidationError = require('../errors/validation-err.js');

const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movie');

moviesRouter.get('/movies', getMovies);
moviesRouter.post('/movies', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    link: Joi.string().custom((value) => {
      if (validator.isURL(value, { require_protocol: true })) return value;
      throw ValidationError('Неправильно введены данные');
    }, 'url-validation').required(),
  }),
}), createMovie);
moviesRouter.delete('/movie/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().hex().length(24).required(),
  }),
}), deleteMovie);

module.exports = moviesRouter;
