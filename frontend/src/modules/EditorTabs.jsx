// src/modules/EditorTabs.jsx
import React from 'react';

const EditorTabs = ({ selectedFiles, activeEditorFile, onTabClick, onCloseTab }) => {
    if (!selectedFiles || selectedFiles.length === 0) return null;

    return (
        <div className="flex items-center overflow-x-auto bg-[#252526] custom-scrollbar select-none">
            {selectedFiles.map(file => {
                const isActive = activeEditorFile?.path === file.path;
                return (
                    <div 
                        key={file.path}
                        className={`flex items-center cursor-pointer min-w-0 max-w-[200px] border-r border-[#2b2b2b] group
                            ${isActive ? 'bg-[#1e1e1e] text-white border-t-[3px] border-t-[#007acc] border-b-[3px] border-b-transparent' : 'bg-[#2d2d2d] text-[#969696] hover:bg-[#2b2b2b] border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent'}
                        `}
                        onClick={() => onTabClick(file)}
                    >
                        <div className="pl-4 pr-2 py-1.5 truncate text-[13px] font-medium" title={file.path}>
                            {file.path.split('/').pop()}
                        </div>
                        <button 
                            className={`p-1 mr-2 opacity-0 group-hover:opacity-100 hover:bg-[#3c3c3c] rounded transition-all ${isActive ? 'opacity-100' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onCloseTab(file);
                            }}
                            title="Close tab"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default EditorTabs;
