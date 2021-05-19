const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-err');
const ServerError = require('../errors/server-err');
const ForbiddenError = require('../errors/forbidden-error');
const ValidationError = require('../errors/validation-err');

const getMovies = (req, res, next) => {
  const { _id } = req.user;
  Movie.find({ owner: _id }, { __v: 0, _id: 0, owner: 0 })
    .then((movies) => {
      if (!movies) throw new ServerError();
      res.status(200).send({ data: movies });
    })
    .catch(next);
};

const createMovie = (req, res, next) => {
  const { _id } = req.user;
  const {
    nameRU,
    nameEN,
    thumbnail,
    trailer,
    image,
    description,
    year,
    duration,
    director,
    country,
    movieId,
  } = req.body;
  Movie.create({
    nameRU,
    nameEN,
    thumbnail,
    trailer,
    image,
    description,
    year,
    duration,
    director,
    country,
    movieId,
    owner: _id,
  }, { __v: 0, _id: 0, owner: 0 })
    .then((movie) => res.status(200).send({ data: movie }))
    .catch((err) => {
      if (err.name === 'ValidationError') throw new ValidationError({ message: 'Неправильно введены данные' });
      return next(err);
    });
};

const deleteMovie = (req, res, next) => {
  const { movieId } = req.params;
  const { _id } = req.user;
  Movie.findById(movieId)
    .then((movie) => {
      if (!movie) throw new NotFoundError('Фильм не найден');
      if (String(movie.owner) !== _id) throw new ForbiddenError('Вы не можете удалить этот фильм');
      return movie;
    }).then((movie) => {
      Movie.findByIdAndDelete(movie.id, { __v: 0, _id: 0, owner: 0 })
        .then(() => res.status(200).send({ data: movie }));
    })
    .catch(next);
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
