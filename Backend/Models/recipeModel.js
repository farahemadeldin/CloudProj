const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: String,
  category: String,
  ingredients: String
});

module.exports = mongoose.model('Recipe', recipeSchema); 