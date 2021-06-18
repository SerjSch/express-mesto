const Card = require("../models/cards");

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(200).send(cards))
    .catch(() =>
      res.status(500).send({
        message: "ошибка по-умолчанию, внутренняя ошибка сервера",
      })
    );
};

const createCard = (req, res) => {
  const owner = req.user._id;
  const { name, link } = req.body;
  Card.create({ name, link, owner })
    .then((card) => res.status(200).send(card))
    .catch((error) => {
      const error_code = 400;
      if (error.name === "CastError")
        return res.status(error_code).send({
          message: "400 — Переданы некорректные данные при создании карточки." });
          else
          res
            .status(500)
            .send({ message: "ошибка по-умолчанию, внутренняя ошибка сервера" });
      });
  };

const deleteCard = (req, res) => {
  Card.findByIdAndDelete(req.params.cardId)
    .then(() => res.status(200).send({ message: "Карточка удалена" }))
    .catch((error) => {
      const error_code = 404;
      if (error.name === "CastError")
        return res
          .status(error_code)
          .send({ message: "404 — Карточка с указанным _id не найдена." });
    });
};

const likeCard = (req, res) => { Card.findByIdAndUpdate(
  req.params.cardId,
  { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
  { new: true },
)
.then(() => res.status(200).send({ message: "Лайк" }))

.catch((error) => {
  const error_code = 400;
  if (error.name === "CastError")
    return res.status(error_code).send({
      message: "Переданы некорректные данные при создании пользователя" });
      else
      res
        .status(500)
        .send({ message: "ошибка по-умолчанию, внутренняя ошибка сервера" });
  });
};

const dislikeCard = (req, res) => {
Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } }, // убрать _id из массива
  { new: true },
)
.then(() => res.status(200).send({ message: "Лайк снят" }))

.catch((error) => {
  const error_code = 400;
  if (error.name === "CastError")
    return res.status(error_code).send({
      message: "Переданы некорректные данные при создании пользователя" });
      else
      res
        .status(500)
        .send({ message: "ошибка по-умолчанию, внутренняя ошибка сервера" });
  });
};



module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard
};