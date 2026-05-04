// src/modules/FileTree.jsx
import React, { useState } from 'react';
import { FolderIcon, FileIcon } from './Icons';

const TreeRenderer = ({ nodes, onFileClick, onToggleSelect, selectedFiles, pathPrefix = '' }) => {
    const [openFolders, setOpenFolders] = useState({});

    const toggleFolder = (e, path) => {
        e.stopPropagation();
        setOpenFolders(prev => ({ ...prev, [path]: !prev[path] }));
    };

    const handleCheckboxChange = (e, node, currentPath) => {
        e.stopPropagation();
        onToggleSelect(node, currentPath);
    };
    
    // Sort so folders appear before files
    const sortedKeys = Object.keys(nodes).sort((a, b) => {
        const nodeA = nodes[a];
        const nodeB = nodes[b];
        if (nodeA.type === nodeB.type) return a.localeCompare(b); // sort alphabetically
        return nodeA.type === 'folder' ? -1 : 1; // folders first
    });

    return sortedKeys.map(key => {
        const currentNode = nodes[key];
        const currentPath = pathPrefix ? `${pathPrefix}/${key}` : key;
        
        if (currentNode.type === 'folder') {
            const isOpen = openFolders[currentPath];
            // Check if all files in this folder are selected (simplified: just visual, actual logic in parent)
            return (
                <div key={currentPath}>
                    <div onClick={(e) => toggleFolder(e, currentPath)} className="flex items-center px-1 py-1 cursor-pointer transition-colors hover:bg-[#2a2d2e] text-[#cccccc]">
                        <input 
                            type="checkbox" 
                            className="mr-2 rounded border-gray-600 outline-none cursor-pointer"
                            onClick={(e) => handleCheckboxChange(e, currentNode, currentPath)}
                            // We can't easily dermine 'checked' state for a folder without traversing all its children recursively, 
                            // so we'll leave it as an explicit mass-toggle action button.
                        />
                        <FolderIcon isOpen={isOpen} />
                        <span className="truncate text-[13px] select-none ml-1">{key}</span>
                    </div>
                    {isOpen && (
                        <div className="pl-3 ml-[18px] border-l border-[#404040]">
                            <TreeRenderer nodes={currentNode.children} onFileClick={onFileClick} onToggleSelect={onToggleSelect} selectedFiles={selectedFiles} pathPrefix={currentPath} />
                        </div>
                    )}
                </div>
            );
        } else { // File
            const isSelected = selectedFiles.some(f => f.path === currentNode.file.path);
            return (
                 <div key={currentPath} className={`flex items-center px-1 py-1 cursor-pointer transition-colors hover:bg-[#2a2d2e] ${isSelected ? 'bg-[#37373d]' : ''}`}>
                    <input 
                        type="checkbox" 
                        className="mr-2 rounded border-gray-600 outline-none cursor-pointer accent-[#007acc]"
                        checked={isSelected}
                        onChange={(e) => handleCheckboxChange(e, currentNode, currentPath)}
                    />
                    <div className="flex items-center flex-1" onClick={() => onFileClick(currentNode.file)}>
                        <FileIcon filename={key} />
                        <span className={`truncate text-[13px] select-none ml-1 ${isSelected ? 'text-white' : 'text-[#cccccc]'}`}>{key}</span>
                    </div>
                </div>
            );
        }
    });
};

const FileTree = ({ tree, onFileClick, onToggleSelect, selectedFiles }) => {
    return <TreeRenderer nodes={tree} onFileClick={onFileClick} onToggleSelect={onToggleSelect} selectedFiles={selectedFiles} />;
};

export default FileTree;