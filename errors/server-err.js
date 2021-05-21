class ServerError extends Error {
  constructor() {
    super('На сервере произошла ошибка');
    this.statusCode = 500;
  }
}

module.exports = ServerError;
