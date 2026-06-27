// src/shared/Loader.jsx
import React from 'react';

const Loader = ({ message = "Loading..." }) => (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 font-sans transition-opacity duration-500">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin [animation-duration:1.5s] mb-4"></div>
        <p className="text-sm font-medium tracking-wide text-gray-500 uppercase">{message}</p>
    </div>
);

export default Loader;