const Card = require('../models/cards');

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(200).send(cards))
    .catch(() => res.status(500).send({
      message: 'ошибка по-умолчанию, внутренняя ошибка сервера',
    }));
};

const createCard = (req, res) => {
  const owner = req.user._id;
  const { name, link } = req.body;
  Card.create({ name, link, owner })
    .then((card) => res.status(200).send(card))
    .catch((error) => {
      const errorCode = 400;
      if (error.name === 'CastError') {
        res.status(errorCode).send({
          message: '400 — Переданы некорректные данные при создании карточки.',
        });
      }
      res
        .status(500)
        .send({ message: 'ошибка по-умолчанию, внутренняя ошибка сервера' });
    });
};
/// //////////////DELETE /cards/:cardId — удаляет карточку по идентификатору
const deleteCard = (req, res) => {
  const owner = req.user._id;
  Card.findById(req.params.cardId)
    .orFail(new Error('NotFound'))
    .then((card) => {
      if (card.owner.toString() !== owner) {
        res.status(403).send({ message: '403 — Это не ваша карточка' });
      }
      Card.findByIdAndDelete(req.params.cardId).then(() => res.status(200).send({ message: 'Карточка удалена' }));
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        res.status(400).send({
          message: '400 — Переданы некорректные данные удаления карточки',
        });
      } else if (error.message === 'NotFound') {
        res
          .status(404)
          .send({ message: '404 — карточка по указанному _id не найдена' });
      } else {
        res
          .status(500)
          .send({ message: 'ошибка по-умолчанию, внутренняя ошибка сервера' });
      }
    });
};

/// ///////////////// PUT /cards/:cardId/likes — поставить лайк карточке
const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .orFail(new Error('NotFound'))
    .then(() => res.status(200).send({ message: 'Лайк' }))

    .catch((error) => {
      if (error.name === 'CastError') {
        res.status(400).send({
          message: '400 — Переданы некорректные данные для постановки лайка',
        });
      } else if (error.message === 'NotFound') {
        res
          .status(404)
          .send({ message: '404 — карточка по указанному _id не найдена' });
      } else {
        res
          .status(500)
          .send({ message: 'ошибка по-умолчанию, внутренняя ошибка сервера' });
      }
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .orFail(new Error('NotFound'))
    .then(() => res.status(200).send({ message: 'Лайк снят' }))
    .catch((error) => {
      if (error.name === 'CastError') {
        res.status(400).send({
          message: '400 — Переданы некорректные данные для снятия лайка',
        });
      } else if (error.message === 'NotFound') {
        res
          .status(404)
          .send({ message: '404 — карточка по указанному _id не найдена' });
      } else {
        res
          .status(500)
          .send({ message: 'ошибка по-умолчанию, внутренняя ошибка сервера' });
      }
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
