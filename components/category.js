const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
    name: { type: String },
});

const categorySchema = new mongoose.Schema({
    name: { type: String },
    subcategories: [subcategorySchema], 
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
