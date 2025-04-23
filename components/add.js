const mongoose = require('mongoose');

const addScheme = new mongoose.Schema({
  image: String,
  heading: String,
  detail: String,
  price: String,
  category: String,
});

const Add = mongoose.model('Add', addScheme);

module.exports = Add;
