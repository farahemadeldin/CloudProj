import React from 'react';
import { Routes, Route } from "react-router-dom";
import RecipeForm from './pages/RecipeForm';
function App() {
  return (
      <Routes>
        {/* Home page */}
        <Route path="/recipe" element={<RecipeForm />} />
      </Routes>
  );
}

export default App;
