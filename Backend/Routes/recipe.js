const express = require('express');
const router = express.Router();
const recipeController = require('../Controller/RecipeService');

// Define routes and ensure each route has a callback function from the controller
router.get('/', recipeController.getAllRecipes);
router.get('/:id', recipeController.getRecipeById);
router.post('/', recipeController.createRecipe);
router.put('/:id', recipeController.updateRecipeById);
router.delete('/:id', recipeController.deleteRecipeById);

module.exports = router;
