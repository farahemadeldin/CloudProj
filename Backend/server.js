const express = require('express');
const AWS = require('aws-sdk');
const recipeRoutes = require('../Backend/Routes/recipe');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();
app.use(express.json());
app.use(cors());

// Set the AWS credentials and region
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Initialize DynamoDB
const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' }); // Specify the API version

// Routes
app.use('/recipes', recipeRoutes); // Use recipeRoutes for /recipes endpoint

// Define route to interact with DynamoDB
app.post('/add', (req, res) => {
  const params = {
    TableName: 'Recipe',
    Item: {
      title: { S: req.body.title }, // Ensure proper data format for DynamoDB
      category: { S: req.body.category },
      ingredients: { S: req.body.ingredients }
    }
  };

  dynamodb.putItem(params, (err, data) => {
    if (err) {
      console.error('Error putting item:', err);
      res.status(500).json({ message: 'Failed to create recipe', error: err });
    } else {
      console.log('Item put successfully:', data);
      res.status(201).json({ message: 'Recipe created successfully', data });
    }
  });
});

// Start server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
