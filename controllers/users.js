/* eslint-disable no-undef */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

/// /////////////   Get   //////////////////////

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send({ users }))
    .catch(() => res
      .status(500)
      .send({ message: 'ошибка по-умолчанию, внутренняя ошибка сервера' }));
};

const getUser = (req, res) => {
  User.findById(req.params.userId)
    .orFail(new Error('NotFound'))

    .then((user) => res.status(200).send(user))
    .catch((error) => {
      if (error.name === 'CastError') {
        res.status(400).send({ message: '400 — Переданы некорректные данные' });
      } else if (error.message === 'NotFound') {
        res
          .status(404)
          .send({ message: '404 — Пользователь по указанному _id не найден' });
      } else {
        res
          .status(500)
          .send({ message: 'ошибка по-умолчанию, внутренняя ошибка сервера' });
      }
    });
};

const getAuthUser = (req, res) => {
  User.findById(req.params.userId)
    .orFail(new Error('NotFound'))

    .then((user) => res.status(200).send(user))
    .catch((error) => {
      if (error.name === 'CastError') {
        res.status(400).send({ message: '400 — Переданы некорректные данные' });
      } else if (error.message === 'NotFound') {
        res
          .status(404)
          .send({ message: '404 — Пользователь по указанному _id не найден' });
      } else {
        res
          .status(500)
          .send({ message: 'ошибка по-умолчанию, внутренняя ошибка сервера' });
      }
    });
};

/// //////////post////////////////////
const createUser = (req, res) => {
  const {
    name, about, avatar, email,
  } = req.body;

  bcrypt.hash(req.body.password, 10).then((hash) => User.create({
    name,
    about,
    avatar,
    email,
    password: hash,
  })
    .then((user) => {
      const userData = {
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
      };
      res.status(200).send(userData);
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        res.status(400).send({
          message: 'Переданы некорректные данные при создании пользователя',
        });
      } else {
        res.status(500).send({
          message: 'ошибка по-умолчанию, внутренняя ошибка сервера',
        });
      }
    }));
};

/// ////////////// PATCH /users/me — обновляет профиль/////////////////////////
const updateUserInfo = (req, res) => {
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
        res.status(400).send({
          message:
            '400 — Переданы некорректные данные при обновлении профиля ValidationError',
        });
      } else if (error.message === 'NotFound') {
        res
          .status(404)
          .send({ message: '404 — Пользователь по указанному _id не найден' });
      } else {
        res
          .status(500)
          .send({ message: 'ошибка по-умолчанию, внутренняя ошибка сервера' });
      }
    });
};

/// PATCH /users/me/avatar — обновляет аватар ///////////////////////////////////
const updateUserAvatar = (req, res) => {
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
        res.status(400).send({
          message:
            '400 — Переданы некорректные данные при обновлении профиля ValidationError',
        });
      } else if (error.message === 'NotFound') {
        res
          .status(404)
          .send({ message: '404 — Пользователь по указанному _id не найден' });
      } else {
        res
          .status(500)
          .send({ message: 'ошибка по-умолчанию, внутренняя ошибка сервера' });
      }
    });
};

// controllers/users.js

const login = (req, res) => {
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
    .catch((err) => {
      // ошибка аутентификации
      res.status(401).send({ message: err.message });
    });
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
