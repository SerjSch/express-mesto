const usersRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validator = require('validator');

const {
  getUsers,
  getUser,
  updateUserInfo,
  updateUserAvatar,
  getAuthUser,
} = require('../controllers/users');

usersRouter.get('/users', getUsers);
usersRouter.get('/users/me', getAuthUser);

usersRouter.get('/users/:userId', celebrate({
  params: Joi.object().keys({
    id: Joi.string().required().hex().length(24),
  }),
}), getUser);

///
usersRouter.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), updateUserInfo);

usersRouter.patch('/users/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().custom((yourUrl, checker) => {
      if (validator.isURL(yourUrl, { require_protocol: true })) {
        return yourUrl;
      }
      return checker.message('Некорректный url-адрес');
    })
      .messages({
        'Joi.any().required()': 'Введите ссылку на аватар',
      }),
  }),
}), updateUserAvatar);

module.exports = usersRouter;
