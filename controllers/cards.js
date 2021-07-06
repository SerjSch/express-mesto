const Card = require('../models/cards');
const NotFoundError = require('../errors/404-not-found-err');
const BadRequestError = require('../errors/400-bad-request-err');
const ForbiddenError = require('../errors/403-forbidden-err');

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.status(200).send(cards))
    .catch(next);
};

const createCard = (req, res, next) => {
  const owner = req.user._id;
  const { name, link } = req.body;
  Card.create({ name, link, owner })
    .then((card) => res.status(200).send(card))
    .catch((error) => {
      if (error.name === 'CastError') {
        throw new BadRequestError(
          '400 — Переданы некорректные данные при создании карточки.',
        );
      }
    })
    .catch(next);
};
/// //////////////DELETE /cards/:cardId — удаляет карточку по идентификатору
const deleteCard = (req, res, next) => {
  const owner = req.user._id;
  Card.findById(req.params.cardId)
    .orFail(new Error('NotFound'))
    .then((card) => {
      if (card.owner.toString() !== owner) {
        throw new ForbiddenError('403 — Это не ваша карточка');
      }
      Card.findByIdAndDelete(req.params.cardId).then(() => res.status(200).send({ message: 'Карточка удалена' }));
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        throw new BadRequestError(
          '400 — Переданы некорректные данные удаления карточки',
        );
      } else if (error.message === 'NotFound') {
        throw new NotFoundError('404 — карточка по указанному _id не найдена');
      }
    })
    .catch(next);
};

/// ///////////////// PUT /cards/:cardId/likes — поставить лайк карточке
const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .orFail(new Error('NotFound'))
    .then(() => res.status(200).send({ message: 'Лайк' }))

    .catch((error) => {
      if (error.name === 'CastError') {
        throw new BadRequestError('400 — Переданы некорректные данные для постановки лайка');
      } else if (error.message === 'NotFound') {
        throw new NotFoundError('404 — карточка по указанному _id не найдена');
      }
    })
    .catch(next);
};

const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .orFail(new Error('NotFound'))
    .then(() => res.status(200).send({ message: 'Лайк снят' }))
    .catch((error) => {
      if (error.name === 'CastError') {
        throw new BadRequestError('400 — Переданы некорректные данные для постановки лайка');
      } else if (error.message === 'NotFound') {
        throw new NotFoundError('404 — карточка по указанному _id не найдена');
      }
    })
    .catch(next);
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
