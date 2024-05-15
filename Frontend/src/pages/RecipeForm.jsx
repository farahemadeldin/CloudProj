import React, { useState, useEffect } from 'react';
import { Form, Modal, Button } from 'react-bootstrap';
import axios from 'axios';
let backend_url = "http://localhost:3000/recipes";
  const RecipeForm = () => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [ingredients, setIngredients] = useState('');

  const handleSubmit = async () => {
    try {
      console.log(category); 
      console.log(title);
      console.log(ingredients);// Ensure that category is defined
      const response = await axios.post(`${backend_url}/add`, { title, category, ingredients });
      setShowModal(false);
      // Optionally, redirect to the recipe list page after successful submission
      // navigate('/recipes');
    } catch (error) {
      console.error('Error creating recipe:', error);
    }
  };

  return (
    <>
      <Button onClick={() => setShowModal(true)}>Create Recipe</Button>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Recipe</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
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
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RecipeForm;
