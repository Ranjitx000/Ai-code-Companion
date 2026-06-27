import React from 'react';
import Home from './home/Home';
import Codeview from './home/Codeview';
import Docs from './home/Docs';
import About from './home/About';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Home route */}
        <Route path="/" element={<Home />} />

        {/* Codeview route */}
        <Route path="/Codeview" element={<Codeview />} />
        
        {/* Docs route */}
        <Route path="/docs" element={<Docs />} />

        {/* About route */}
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
};

export default App;

