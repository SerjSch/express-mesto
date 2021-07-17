require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');
const { login, createUser } = require('./controllers/users');
const usersRouter = require('./routes/users');
const cardRouter = require('./routes/cards');
const auth = require('./middlewares/auth');
const NotFoundError = require('./errors/404-not-found-err');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const app = express();
// Слушаем 3000 порт
const PORT = 3000;
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.use(requestLogger); // подключаем логгер запросов

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(/^https?:\/\/(www\.)?([a-zA-Z0-9-])+\.([a-zA-Z])+\/?([a-zA-Z0-9\-_~:/#[\]@!&â€™,;=]+)/),
  }),
}), createUser);

app.use(auth);
app.use('/', usersRouter); // запускаем
app.use('/', cardRouter); // запускаем

// обработчики ошибок
// eslint-disable-next-line no-unused-vars
app.get('*', (req, res) => {
  throw new NotFoundError('404 - Запрашиваемый ресурс не найден');
});

app.use(errorLogger); // подключаем логгер ошибок

app.use(errors()); // обработчик ошибок celebrate

// здесь обрабатываем все ошибки
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      message: statusCode === 500 ? '500 - ошибка по-умолчанию, внутренняя ошибка сервера' : message,
    });
});

app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
