const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  endpoint: ' arn:aws:dynamodb:us-east-1:637423376971:table/Recipe'
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const recipeController = {
  createRecipe: async (req, res) => {
    try {
      const { title, category, ingredients } = req.body;
      const id = uuidv4();
      const params = {
        TableName: 'Recipes',
        Item: {
          id,
          title,
          category,
          ingredients
        }
      };
      await dynamoDB.put(params).promise();
      res.status(201).json({ message: 'Recipe created successfully' });
    } catch (error) {
      console.error('Error creating recipe:', error);
      res.status(500).json({ message: 'Failed to create recipe', error: error.message });
    }
  },

  getAllRecipes: async (req, res) => {
    try {
      const params = { TableName: 'Recipes' };
      const data = await dynamoDB.scan(params).promise();
      res.status(200).json(data.Items);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  getRecipeById: async (req, res) => {
    const { id } = req.params;
    try {
      const params = {
        TableName: 'Recipes',
        Key: { id }
      };
      const data = await dynamoDB.get(params).promise();
      if (!data.Item) {
        return res.status(404).json({ message: 'Recipe not found' });
      }
      res.status(200).json(data.Item);
    } catch (error) {
      console.error('Error fetching recipe by ID:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  updateRecipeById: async (req, res) => {
    const { id } = req.params;
    try {
      const params = {
        TableName: 'Recipes',
        Key: { id },
        UpdateExpression: 'set title = :title, category = :category, ingredients = :ingredients',
        ExpressionAttributeValues: {
          ':title': req.body.title,
          ':category': req.body.category,
          ':ingredients': req.body.ingredients
        },
        ReturnValues: 'ALL_NEW'
      };
      const data = await dynamoDB.update(params).promise();
      res.status(200).json(data.Attributes);
    } catch (error) {
      console.error('Error updating recipe by ID:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  deleteRecipeById: async (req, res) => {
    const { id } = req.params;
    try {
      const params = {
        TableName: 'Recipes',
        Key: { id }
      };
      await dynamoDB.delete(params).promise();
      res.status(200).json({ message: 'Recipe deleted successfully' });
    } catch (error) {
      console.error('Error deleting recipe by ID:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = recipeController;
