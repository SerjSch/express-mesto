const express = require("express");
const bodyParser = require('body-parser')
const path = require('path')
const usersRouter = require('./routes/users');
const cardRouter = require('./routes/cards');
const mongoose = require("mongoose");

const app = express();
// Слушаем 3000 порт
const PORT = 3000

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.use((req, res, next) => {
  req.user = {
    _id: '60cbc5a42ba1681e90b12314' // вставьте сюда _id созданного в предыдущем пункте пользователя
  };
  next();
});

app.use('/', usersRouter); // запускаем
app.use('/', cardRouter); // запускаем

console.log("ПРИВЭТ!");



mongoose.connect("mongodb://localhost:27017/mestodb", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  console.log(`App listening on port ${PORT}`);
});
