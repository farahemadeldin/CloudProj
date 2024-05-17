import React, { useState, useEffect } from 'react';
import { Form, Modal, Button, Row, Col, Container, Table } from 'react-bootstrap';
import axios from 'axios';

let backend_url = "http://localhost:3000/recipes";

const RecipeForm = () => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [image, setImage] = useState(null);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await axios.get(backend_url);
      setRecipes(response.data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const handleEdit = (recipe) => {
    setCurrentRecipe(recipe);
    setTitle(recipe.title);
    setCategory(recipe.category);
    setIngredients(recipe.ingredients);
    setShowModal(true);
  };

  const handleDelete = async (recipe) => {
    try {
      await axios.delete(`${backend_url}/${recipe.id}`);
      setRecipes((prevRecipes) =>
        prevRecipes.filter((r) => r.id !== recipe.id)
      );
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('ingredients', ingredients);
      if (image) {
        formData.append('image', image);
      }

      if (currentRecipe) {
        const response = await axios.put( `${backend_url}/${currentRecipe.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setRecipes((prevRecipes) =>
          prevRecipes.map((recipe) =>
            recipe.id === currentRecipe.id ? response.data : recipe
          )
        );
      } else {
        const response = await axios.post(`${backend_url}/add`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setRecipes((prevRecipes) => [...prevRecipes, response.data]);
      }
      setShowModal(false);
      setCurrentRecipe(null);
      setTitle('');
      setCategory('');
      setIngredients('');
      setImage(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Container>
      <Row className="my-3">
        <Col>
          <Button variant="info" onClick={() => { setCurrentRecipe(null); setShowModal(true); }}>Create Recipe</Button>
        </Col>
        <Col>
          <Button variant="info" onClick={() => setShowModal(true)} disabled={!currentRecipe}>Edit Recipe</Button>
        </Col>
        <Col>
          <Button variant="danger" onClick={() => handleDelete(currentRecipe)} disabled={!currentRecipe}>Delete Recipe</Button>
        </Col>
      </Row>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Category</th>
            <th>Ingredients</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {recipes.map((recipe, index) => (
            <tr key={recipe.id}>
              <td>{index + 1}</td>
              <td>{recipe.title}</td>
              <td>{recipe.category}</td>
              <td>{recipe.ingredients}</td>
              <td>
                {recipe.imageUrl && <img src={recipe.imageUrl} alt={recipe.title} style={{ width: '100px', height: 'auto' }} />}
              </td>
              <td>
                <Button variant="info" onClick={() => handleEdit(recipe)}>Edit</Button>{' '}
                <Button variant="danger" onClick={() => handleDelete(recipe)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentRecipe ? 'Edit Recipe' : 'Create Recipe'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" placeholder="Enter title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="formCategory">
              <Form.Label>Category</Form.Label>
              <Form.Control type="text" placeholder="Enter category" value={category} onChange={(e) => setCategory(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="formIngredients">
              <Form.Label>Ingredients</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Enter ingredients" value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="formImage">
              <Form.Label>Image</Form.Label>
              <Form.Control type="file" onChange={(e) => setImage(e.target.files[0])} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {currentRecipe ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RecipeForm;