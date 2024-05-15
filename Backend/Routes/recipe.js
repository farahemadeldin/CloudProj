const express = require("express");
const router = express.Router();
const RecipeController = require("../Controller/RecipeService"); // Fix casing issue


router.post("/add",  RecipeController.createRecipe);
router.get('/', RecipeController.getAllRecipes);
router.get("/:id", RecipeController.getRecipeById);
router.put("/:id", RecipeController.updateRecipeById);
router.delete("/:id", RecipeController.deleteRecipeById);

module.exports = router; // Export the router
