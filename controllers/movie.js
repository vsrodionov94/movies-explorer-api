const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-err');
const ServerError = require('../errors/server-err');
const ForbiddenError = require('../errors/forbidden-error');
const ValidationError = require('../errors/validation-err');

const getMovies = (req, res, next) => {
  const { _id } = req.user;
  Movie.find({ owner: _id }, { __v: 0, _id: 0, owner: 0 }).then((movies) => {
    if (!movies) throw new ServerError();
    res.status(200).send({ data: movies });
  }).catch(next);
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
  }).then((movie) => res.status(200).send({
    data: {
      nameRU: movie.nameRU,
      nameEN: movie.nameEN,
      thumbnail: movie.thumbnail,
      trailer: movie.trailer,
      image: movie.image,
      description: movie.description,
      year: movie.year,
      duration: movie.duration,
      director: movie.director,
      country: movie.country,
      movieId: movie.movieId,
      _id: movie._id,
    },
  })).catch((err) => {
    if (err.name === 'ValidationError') throw new ValidationError({ message: 'Неправильно введены данные' });
    return next(err);
  });
};

const deleteMovie = (req, res, next) => {
  const { movieId } = req.params;
  const { _id } = req.user;
  Movie.findById(movieId).then((movie) => {
    if (!movie) throw new NotFoundError('Фильм не найден');
    if (String(movie.owner) !== _id) throw new ForbiddenError('Вы не можете удалить этот фильм');
    return movie;
  }).then((movie) => {
    Movie.findByIdAndDelete(movie.id)
      .then((deletedMovie) => res.status(200).send({
        data: {
          nameRU: deletedMovie.nameRU,
          nameEN: deletedMovie.nameEN,
          thumbnail: deletedMovie.thumbnail,
          trailer: deletedMovie.trailer,
          image: deletedMovie.image,
          description: deletedMovie.description,
          year: deletedMovie.year,
          duration: deletedMovie.duration,
          director: deletedMovie.director,
          country: deletedMovie.country,
          movieId: deletedMovie.movieId,
          _id: deletedMovie._id,
        },
      }));
  }).catch(next);
};

module.exports = {
  getMovies,
  createMovie,
  deleteMovie,
};
