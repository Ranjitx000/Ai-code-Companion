import React from 'react';
import Home from './home/Home';
import Codeview from './home/Codeview';
import Docs from './home/Docs';
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
      </Routes>
    </Router>
  );
};

export default App;

