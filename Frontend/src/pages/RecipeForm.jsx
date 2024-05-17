import React, { useState, useEffect } from 'react';
import { Form, Modal, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const backend_url = "http://localhost:3000/recipes";

const RecipeForm = ({ recipe, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [ingredients, setIngredients] = useState('');

  useEffect(() => {
    if (recipe) {
      setTitle(recipe.title);
      setCategory(recipe.category);
      setIngredients(recipe.ingredients);
    }
  }, [recipe]);

  const handleSubmit = async () => {
    try {
      const requestData = { title, category, ingredients };
      if (recipe) {
        // Edit existing recipe
        const response = await axios.put(`${backend_url}/${recipe.id}`, requestData);
        onUpdate(response.data); // Update the state in the parent component
      } else {
        // Create new recipe
        const response = await axios.post(`${backend_url}`, requestData);
        onUpdate(response.data); // Update the state in the parent component
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error:', error);
      // Add error handling here
      alert('Failed to submit recipe. Please try again later.');
    }
  };

  const handleDelete = async () => {
    try {
      if (recipe) {
        // Delete existing recipe
        await axios.delete(`${backend_url}/${recipe.id}`);
        onUpdate(null); // Notify parent component about deletion
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      // Add error handling here
      alert('Failed to delete recipe. Please try again later.');
    }
  };

  return (
    <>
      <Row>
        <Col>
          <Button variant="info" onClick={() => setShowModal(true)}>Create Recipe</Button>
        </Col>
        <Col>
          <Button variant="info" onClick={() => setShowModal(true)}>Edit Recipe</Button>
        </Col>
        {recipe && (
          <Col>
            <Button variant="danger" onClick={handleDelete}>Delete Recipe</Button>
          </Col>
        )}
      </Row>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{recipe ? 'Edit Recipe' : 'Create Recipe' }</Modal.Title>
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
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {recipe ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RecipeForm;
