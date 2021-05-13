const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-err');
const ServerError = require('../errors/server-err');
const ForbiddenError = require('../errors/forbidden-error');
const ValidationError = require('../errors/validation-err');

const getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => {
      if (!movies) throw new ServerError();
      res.status(200).send({ data: movies });
    })
    .catch(next);
};

const createMovie = (req, res, next) => {
  const { name, link } = req.body;
  Movie.create({ name, link, owner: req.user._id })
    .then((movie) => res.status(200).send({ data: movie }))
    .catch((err) => {
      if (err.name === 'ValidationError') throw new ValidationError({ message: 'Неправильно введены данные' });
      return next(err);
    });
};

const deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then((movie) => {
      if (!movie) throw new NotFoundError('Фильм не найден');
      if (String(movie.owner) !== req.user._id) throw new ForbiddenError('Вы не можете удалить этот фильм');
      return movie;
    }).then((movie) => {
      Movie.findByIdAndDelete(movie.id).then(() => res.status(200).send({ data: movie }));
    })
    .catch(next);
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
