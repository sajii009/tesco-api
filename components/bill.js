const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartItemSchema = new Schema({
  id: String,
  title: String,
  quantity: String,
  price: String,
}, { _id: false });

const billSchema = new Schema({
  email: String,
  name: String,
  address: String,
  house: String,
  city: String,
  postalCode: String,
  phone: String,
  status:String,
  cart: [cartItemSchema],
});

const Bill = mongoose.model('Bill', billSchema);

module.exports = Bill;
