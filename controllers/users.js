/* eslint-disable no-undef */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/404-not-found-err');
const ConflictError = require('../errors/409-conflict-err');
const BadRequestError = require('../errors/400-bad-request-err');
const UnauthorizedError = require('../errors/401-unauthorized-err');

const { NODE_ENV, JWT_SECRET } = process.env;

/// /////////////   Get   //////////////////////

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(200).send({ users }))
    .catch(next);
};

const getUser = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(new Error('NotFound'))
    .then((user) => res.status(200).send(user))
    .catch((error) => {
      if (error.name === 'CastError') {
        throw new BadRequestError('400 — Переданы некорректные данные');
      } else if (error.message === 'NotFound') {
        throw new NotFoundError(
          '404 — Пользователь по указанному _id не найден',
        );
      }
    })
    .catch(next);
};

const getAuthUser = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(new Error('NotFound'))
    .then((user) => res.status(200).send(user))
    .catch(next);
};

/// //////////post////////////////////
const createUser = (req, res, next) => {
  const {
    name, about, avatar, email,
  } = req.body;

  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }).then((user) => {
      const userData = {
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
      };
      res.status(200).send(userData);
    }))
    .catch((error) => {
      if (error.name === 'CastError') {
        throw new BadRequestError(
          'Переданы некорректные данные при создании пользователя',
        );
      }
      if (error.name === 'MongoError' || error.code === '11000') {
        throw new ConflictError('Конфликт ошибка');
      }
    })
    .catch(next);
};

/// ////////////// PATCH /users/me — обновляет профиль/////////////////////////
const updateUserInfo = (req, res, next) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      about: req.body.about,
    },
    { new: true, runValidators: true },
  )
    .orFail(new Error('NotFound'))
    .then((user) => res.status(200).send(user))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        throw new BadRequestError(
          '400 — Переданы некорректные данные при обновлении профиля ValidationError',
        );
      } else if (error.message === 'NotFound') {
        throw new NotFoundError(
          '404 — Пользователь по указанному _id не найден',
        );
      }
    })
    .catch(next);
};

/// PATCH /users/me/avatar — обновляет аватар ///////////////////////////////////
const updateUserAvatar = (req, res, next) => {
  User.findByIdAndUpdate(
    req.user._id,
    { avatar: req.body.avatar },
    { new: true, runValidators: true },
  )
    .then((user) => {
      res.status(200).send({ data: user });
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        throw new BadRequestError(
          '400 — Переданы некорректные данные при обновлении аватара ValidationError',
        );
      } else if (error.message === 'NotFound') {
        throw new NotFoundError(
          '404 — Пользователь по указанному _id не найден',
        );
      }
    })
    .catch(next);
};

// controllers/users.js

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      return res.send({ token });
    })
    .catch(() => {
      // ошибка аутентификации
      throw new UnauthorizedError('401 — ошибка аутентификации');
    })
    .catch(next);
};

/// /////////////////////////////////////////////////////////////////////////////
module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUserInfo,
  updateUserAvatar,
  login,
  getAuthUser,
};
