const cardRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validator = require('validator');

const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

cardRouter.get('/cards', getCards);

cardRouter.post('/cards', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().custom((yourUrl, checker) => {
      if (validator.isURL(yourUrl, { require_protocol: true })) {
        return yourUrl;
      }
      return checker.message('Некорректный url-адрес');
    })
      .messages({
        'Joi.any().required()': 'Введите ссылку на картинку',
      }),
  }),
}), createCard);

cardRouter.delete('/cards/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required().hex().length(24),
  }),
}), deleteCard);

cardRouter.put('/cards/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required().hex().length(24),
  }),
}), likeCard);
cardRouter.delete('/cards/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required().hex().length(24),
  }),
}), dislikeCard);

module.exports = cardRouter;
