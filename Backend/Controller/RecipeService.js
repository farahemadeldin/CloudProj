const AWS = require('aws-sdk');

// Initialize DynamoDB client
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const recipeController = {
  // Create a new recipe
  createRecipe: async (req, res) => {
    try {
      const { title, category, ingredients } = req.body;
      
      // Define the params for the PutItem operation
      const params = {
        TableName: 'Recipe', // Specify your DynamoDB table name
        Item: {
          title,
          category,
          ingredients
        }
      };
      
      // Perform the PutItem operation to create a new item in the table
      await dynamoDB.put(params).promise();
      
      res.status(201).json({ message: 'Recipe created successfully' });
    } catch (error) {
      console.error('Error creating recipe:', error);
      res.status(500).json({ message: 'Failed to create recipe', error: error.message });
    }
  },

  // Get all recipes
  getAllRecipes: async (req, res) => {
    try {
      // Define the params for the Scan operation (assuming no filters are applied)
      const params = {
        TableName: 'Recipe', // Specify your DynamoDB table name
      };
      
      // Perform the Scan operation to retrieve all items from the table
      const data = await dynamoDB.scan(params).promise();
      
      res.status(200).json(data.Items);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Get a single recipe by ID
  getRecipeById: async (req, res) => {
    const { id } = req.params;
    try {
      // Define the params for the GetItem operation
      const params = {
        TableName: 'Recipe', // Specify your DynamoDB table name
        Key: {
          title: id // Assuming 'title' is the primary key in your DynamoDB table
        }
      };
      
      // Perform the GetItem operation to retrieve the item by ID
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

  // Update a recipe by ID
  updateRecipeById: async (req, res) => {
    const { id } = req.params;
    try {
      // Define the params for the UpdateItem operation
      const params = {
        TableName: 'Recipe', // Specify your DynamoDB table name
        Key: {
          title: id // Assuming 'title' is the primary key in your DynamoDB table
        },
        UpdateExpression: 'set #category = :category, #ingredients = :ingredients',
        ExpressionAttributeNames: {
          '#category': 'category',
          '#ingredients': 'ingredients'
        },
        ExpressionAttributeValues: {
          ':category': req.body.category,
          ':ingredients': req.body.ingredients
        },
        ReturnValues: 'ALL_NEW'
      };
      
      // Perform the UpdateItem operation to update the item by ID
      const data = await dynamoDB.update(params).promise();
      
      res.status(200).json(data.Attributes);
    } catch (error) {
      console.error('Error updating recipe by ID:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Delete a recipe by ID
  deleteRecipeById: async (req, res) => {
    const { id } = req.params;
    try {
      // Define the params for the DeleteItem operation
      const params = {
        TableName: 'Recipe', // Specify your DynamoDB table name
        Key: {
          title: id // Assuming 'title' is the primary key in your DynamoDB table
        }
      };
      
      // Perform the DeleteItem operation to delete the item by ID
      await dynamoDB.delete(params).promise();
      
      res.status(200).json({ message: 'Recipe deleted successfully' });
    } catch (error) {
      console.error('Error deleting recipe by ID:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = recipeController;
