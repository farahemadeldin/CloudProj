const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand, GetCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const uuid = require('uuid');
const fs = require('fs');
const path = require('path');

const { fromCognitoIdentityPool } = require('@aws-sdk/credential-provider-node'); // Example import for credentials provider
const { createRequest } = require('@aws-sdk/util-create-request'); // Example import for util-create-request
const s3Client = new S3Client({
  region: 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketName = 'my-recipe-buckett';

const uploadImageToS3 = async (file) => {
  const fileContent = Buffer.from(file.data, 'binary');
  const params = {
    Bucket: bucketName,
    Key: `${uuid.v4()}-${file.name}`,
    Body: fileContent,
    ContentType: file.mimetype,
    ACL: 'public-read',
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return https://'${bucketName}.s3.${s3Client.config.region}.amazonaws.com/${params.Key}';
  } catch (error) {
    console.error('Error uploading image to S3:', error);
    throw new Error('Failed to upload image to S3');
  }
};

const deleteImageFromS3 = async (imageUrl) => {
  const key = imageUrl.split('/').slice(-1)[0];
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  try {
    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting image from S3:', error);
    throw new Error('Failed to delete image from S3');
  }
};

const dynamoDBClient = new DynamoDBClient({ region: 'us-east-2' });
const dynamoDB = DynamoDBDocumentClient.from(dynamoDBClient);

const recipeController = {
  createRecipe: async (req, res) => {
    try {
      const { title, category, ingredients } = req.body;
      const file = req.files ? req.files.image : null;

      let imageUrl = '';
      if (file) {
        imageUrl = await uploadImageToS3(file);
      } else {
        const localFilePath = path.join(__dirname, 'hh.jpg');
        imageUrl = await uploadImageToS3({ data: fs.readFileSync(localFilePath), name: path.basename(localFilePath), mimetype: 'image/jpeg' });
      }

      const params = {
        TableName: 'Recipe',
        Item: {
          title,
          category,
          ingredients,
          imageUrl,
          createdAt: new Date().toISOString(),
        },
      };

      await dynamoDB.send(new PutCommand(params));

      res.status(201).json({ message: 'Recipe created successfully', recipe: params.Item });
    } catch (error) {
      console.error('Error creating recipe:', error);
      res.status(500).json({ message: 'Failed to create recipe', error: error.message });
    }
  },

  getAllRecipes: async (req, res) => {
    try {
      const params = {
        TableName: 'Recipe',
      };

      const data = await dynamoDB.send(new ScanCommand(params));

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
        TableName: 'Recipe',
        Key: {
          title: id,
        },
      };

      const data = await dynamoDB.send(new GetCommand(params));

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
      const { category, ingredients } = req.body;
      const file = req.files ? req.files.image : null;

      let imageUrl = '';
      let oldImageUrl = '';
      if (file) {
        imageUrl = await uploadImageToS3(file);

        const getParams = {
          TableName: 'Recipe',
          Key: {
            title: id,
          },
        };
        const data = await dynamoDB.send(new GetCommand(getParams));
        if (data.Item && data.Item.imageUrl) {
          oldImageUrl = data.Item.imageUrl;
        }
      }

      const params = {
        TableName: 'Recipe',
        Key: {
          title: id,
        },
        UpdateExpression: 'set #category = :category, #ingredients = :ingredients',
        ExpressionAttributeNames: {
          '#category': 'category',
          '#ingredients': 'ingredients',
        },
        ExpressionAttributeValues: {
          ':category': category,
          ':ingredients': ingredients,
        },
        ReturnValues: 'ALL_NEW',
      };

      if (imageUrl) {
        params.UpdateExpression += ', #imageUrl = :imageUrl';
        params.ExpressionAttributeNames['#imageUrl'] = 'imageUrl';
        params.ExpressionAttributeValues[':imageUrl'] = imageUrl;
      }

      const data = await dynamoDB.send(new UpdateCommand(params));

      if (oldImageUrl) {
        await deleteImageFromS3(oldImageUrl);
      }

      res.status(200).json(data.Attributes);
    } catch (error) {
      console.error('Error updating recipe by ID:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  deleteRecipeById: async (req, res) => {
    const { id } = req.params;
    try {
      const getParams = {
        TableName: 'Recipe',
        Key: {
          title: id,
        },
      };
      const data = await dynamoDB.send(new GetCommand(getParams));
      let imageUrl = '';
      if (data.Item && data.Item.imageUrl) {
        imageUrl = data.Item.imageUrl;
      }

      const params = {
        TableName: 'Recipe',
        Key: {
          title: id,
        },
      };

      await dynamoDB.send(new DeleteCommand(params));

      if (imageUrl) {
        await deleteImageFromS3(imageUrl);
      }

      res.status(200).json({ message: 'Recipe deleted successfully' });
    } catch (error) {
      console.error('Error deleting recipe by ID:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
};

module.exports = recipeController;