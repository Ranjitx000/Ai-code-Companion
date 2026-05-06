import React, { useState, useRef, useCallback, useEffect } from 'react';
import { parseRepoUrl, fetchRepoTree, fetchFileContent } from '../services/githubService';
import { callGemini, streamGemini } from '../services/geminiService';
import { prompts } from '../utils/promptTemplates';
import confetti from 'canvas-confetti';
import { buildFileTree } from '../utils/formatHelpers';
import { Menu, X, Code, Terminal, Brain, Search, Database, Globe, Command, Info, Files, GitBranch, Settings, Plug } from 'lucide-react';

import { usePersistentState } from '../hooks/usePersistentState';
import FileTree from '../modules/FileTree';
import CodeViewer from '../modules/CodeViewer';
import SnippetPopup from '../modules/SnippetPopup';
import Tabs from '../modules/Tabs';
import EditorTabs from '../modules/EditorTabs';
import Button from '../shared/Button';
import Loader from '../shared/Loader';
import { useAuth } from '../hooks/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';

const Codeview = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            navigate('/');
        }
    }, [user, navigate]);

    // Confetti fireworks when user arrives from Home page buttons
    useEffect(() => {
        if (!location.state?.showConfetti) return;

        // Clear the state so refresh won't re-trigger
        window.history.replaceState({}, '');

        // Small delay to let the page render first
        const startTimer = setTimeout(() => {
            const duration = 5 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

            const randomInRange = (min, max) => Math.random() * (max - min) + min;

            const interval = window.setInterval(() => {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() * 0.5 + 0.2 },
                });
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() * 0.5 + 0.2 },
                });
            }, 250);

            return () => clearInterval(interval);
        }, 300);

        return () => clearTimeout(startTimer);
    }, [location.state]);

    // State for Repo and Files
    const [repoUrl, setRepoUrl] = usePersistentState('app_repoUrl', 'https://github.com/d3/d3');
    const [repoInfo, setRepoInfo] = usePersistentState('app_repoInfo', null);
    const [fileTree, setFileTree] = usePersistentState('app_fileTree', {});
    const [selectedFiles, setSelectedFiles] = usePersistentState('app_selectedFiles', []);
    const [activeEditorFile, setActiveEditorFile] = usePersistentState('app_activeEditorFile', null);
    const [openFilesContents, setOpenFilesContents] = usePersistentState('app_openFilesContents', {});
    const [editedContent, setEditedContent] = usePersistentState('app_editedContent', '');
    
    // State for AI Analysis
    const [analysis, setAnalysis] = usePersistentState('app_analysis', {});
    const [activeTab, setActiveTab] = usePersistentState('app_activeTab', 'explanation');

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [isTabLoading, setIsTabLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null); // VS Code menu state
    
    // Refs
    const codeViewerRef = useRef(null);
    const snippetPopupRef = useRef(null);
    const fetchControllerRef = useRef(null);
    const menuBarRef = useRef(null);
    
    // Resizable Panels
    const [leftPanelWidth, setLeftPanelWidth] = useState(22);
    const [topPanelHeight, setTopPanelHeight] = useState(65);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const isResizingVertical = useRef(false);
    const isResizingHorizontal = useRef(false);
    const mainContentRef = useRef(null);

    // --- Responsive Logic ---
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuBarRef.current && !menuBarRef.current.contains(e.target)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- Resizing Logic ---
    const handleVerticalResize = useCallback((e) => {
        if (isResizingVertical.current) {
            const newWidth = (e.clientX / window.innerWidth) * 100;
            if (newWidth > 15 && newWidth < 40) setLeftPanelWidth(newWidth);
        }
    }, []);

    const handleHorizontalResize = useCallback((e) => {
        if (isResizingHorizontal.current && mainContentRef.current) {
            const mainPanelRect = mainContentRef.current.getBoundingClientRect();
            const newHeight = ((e.clientY - mainPanelRect.top) / mainPanelRect.height) * 100;
            if (newHeight > 30 && newHeight < 80) setTopPanelHeight(newHeight);
        }
    }, []);

    const stopResizing = useCallback(() => {
        isResizingVertical.current = false;
        isResizingHorizontal.current = false;
        document.body.style.cursor = 'default';
        window.removeEventListener('mousemove', handleVerticalResize);
        window.removeEventListener('mousemove', handleHorizontalResize);
        window.removeEventListener('mouseup', stopResizing);
    }, [handleVerticalResize, handleHorizontalResize]);

    const startVerticalResize = useCallback((e) => {
        e.preventDefault();
        isResizingVertical.current = true;
        document.body.style.cursor = 'col-resize';
        window.addEventListener('mousemove', handleVerticalResize);
        window.addEventListener('mouseup', stopResizing);
    }, [handleVerticalResize, stopResizing]);

    const startHorizontalResize = useCallback((e) => {
        e.preventDefault();
        isResizingHorizontal.current = true;
        document.body.style.cursor = 'row-resize';
        window.addEventListener('mousemove', handleHorizontalResize);
        window.addEventListener('mouseup', stopResizing);
    }, [handleHorizontalResize, stopResizing]);
    
    const [isIndexing, setIsIndexing] = useState(false);
    // ✅ FIX: persist across page reloads — index on disk survives restarts
    const [isIndexComplete, setIsIndexComplete] = usePersistentState('app_isIndexComplete', false);

    // ✅ FIX: On mount, if we have repoInfo, verify index still exists on backend
    useEffect(() => {
        const checkIndexStatus = async () => {
            if (!repoInfo) return;
            try {
                const res = await fetch(
                    `http://localhost:3001/api/rag/stats?owner=${repoInfo.owner}&repo=${repoInfo.repo}`
                );
                if (res.ok) {
                    setIsIndexComplete(true); // index exists on disk
                } else {
                    setIsIndexComplete(false); // 404 = not indexed yet
                }
            } catch {
                // backend offline — keep whatever persisted state we have
            }
        };
        checkIndexStatus();
    }, []); // run once on mount

    // --- Data & File Handling Logic ---
    const handleLoadRepo = async () => {
        if (fetchControllerRef.current) fetchControllerRef.current.abort();
        const controller = new AbortController();
        fetchControllerRef.current = controller;

        const info = parseRepoUrl(repoUrl);
        if (!info) {
            setError("Invalid GitHub repository URL.");
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setFileTree({});
        setSelectedFiles([]);
        setActiveEditorFile(null);
        setOpenFilesContents({});
        setEditedContent('');
        setAnalysis({});
        setRepoInfo(info);
        setIsIndexComplete(false);

        try {
            const files = await fetchRepoTree(info.owner, info.repo, controller.signal);
            setFileTree(buildFileTree(files));
        } catch (err) {
            if (err.name !== 'AbortError') setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleIndexWorkspace = async () => {
        if (!repoInfo) return;
        setIsIndexing(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:3001/api/rag/index', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ owner: repoInfo.owner, repo: repoInfo.repo })
            });
            if (!response.ok) throw new Error("Indexing failed");
            setIsIndexComplete(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsIndexing(false);
        }
    };

    const handleWorkspaceAsk = async (question) => {
        // ✅ FIX: Show proper errors instead of silently returning
        if (!repoInfo) {
            setError('No repository loaded. Please load a repo first.');
            return;
        }
        if (!question || !question.trim()) {
            setError('Please enter a question before searching.');
            return;
        }
        if (!isIndexComplete) {
            setError('Repository not indexed yet. Click "Build Knowledge Base" in the sidebar first.');
            return;
        }

        setIsTabLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:3001/api/rag/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    owner: repoInfo.owner,
                    repo: repoInfo.repo,
                    query: question.trim(),
                })
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Server error ${response.status}`);
            }
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setAnalysis(prev => ({
                ...prev,
                workspaceAnswer: data.result,
                sources: data.sources,
                chunksUsed: data.chunksUsed,
            }));
        } catch (err) {
            setError(`Workspace search failed: ${err.message}`);
        } finally {
            setIsTabLoading(false);
        }
    };

    const handleToggleSelect = useCallback((node, currentPath) => {
        if (node.type === 'folder') {
            const collectDeepFiles = (childrenObj) => {
                 let arr = [];
                 Object.values(childrenObj).forEach(child => {
                     if (child.type === 'folder') arr = arr.concat(collectDeepFiles(child.children));
                     else arr.push(child.file);
                 });
                 return arr;
            };
            const folderFiles = collectDeepFiles(node.children);
            
            setSelectedFiles(prev => {
                const allSelected = folderFiles.every(f => prev.some(sel => sel.path === f.path));
                if (allSelected) {
                    return prev.filter(f => !folderFiles.some(ff => ff.path === f.path));
                } else {
                    const newFiles = [...prev];
                    folderFiles.forEach(f => {
                         if (!newFiles.some(sel => sel.path === f.path)) newFiles.push(f);
                    });
                    return newFiles;
                }
            });
        } else {
            setSelectedFiles(prev => {
                const exists = prev.some(f => f.path === node.file.path);
                if (exists) return prev.filter(f => f.path !== node.file.path);
                return [...prev, node.file];
            });
        }
    }, [selectedFiles]);

    const handleFileClick = async (file) => {
        setSelectedFiles(prev => prev.some(f => f.path === file.path) ? prev : [...prev, file]);
        setActiveEditorFile(file);
        setActiveTab('explanation');

        if (openFilesContents[file.path] !== undefined) {
             setEditedContent(openFilesContents[file.path]);
             return;
        }

        if (fetchControllerRef.current) fetchControllerRef.current.abort();
        const controller = new AbortController();
        fetchControllerRef.current = controller;

        setIsLoading(true);
        setError(null);
        setEditedContent('// Loading...');

        try {
            const content = await fetchFileContent(repoInfo.owner, repoInfo.repo, file.path, controller.signal);
            setOpenFilesContents(prev => ({ ...prev, [file.path]: content }));
            setEditedContent(content); 
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(`Failed to fetch file: ${err.message}`);
                setEditedContent('// Failed to load file');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCloseTab = (file) => {
        setSelectedFiles(prev => {
            const newSelected = prev.filter(f => f.path !== file.path);
            if (activeEditorFile?.path === file.path) {
                if (newSelected.length > 0) {
                    const nextFile = newSelected[newSelected.length - 1];
                    setTimeout(() => handleFileClick(nextFile), 0);
                } else {
                    setActiveEditorFile(null);
                    setEditedContent('');
                }
            }
            return newSelected;
        });
    };
    
    const handleContentChange = (newContent) => {
        setEditedContent(newContent);
        if (activeEditorFile) {
            setOpenFilesContents(prev => ({ ...prev, [activeEditorFile.path]: newContent }));
        }
    };

    const handleDownloadFile = () => {
        if (!activeEditorFile || editedContent === null) return;
        const blob = new Blob([editedContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = activeEditorFile.path.split('/').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    
    const handleGenerateForTab = async (tabName, question = '') => {
        if (!editedContent && selectedFiles.length === 0 && tabName !== 'architecture') return;
        // Architecture tab needs a loaded repo (file tree)
        if (tabName === 'architecture' && Object.keys(fileTree).length === 0) {
            setError('Please load a GitHub repository first before generating the architecture diagram.');
            return;
        }
        setIsTabLoading(true);
        setError(null);
        
        try {
            let finalContext = editedContent;
            let finalPath = activeEditorFile?.path || "";

            if (selectedFiles.length > 1) {
                const missingFiles = selectedFiles.filter(f => openFilesContents[f.path] === undefined);
                if (missingFiles.length > 0) {
                    const controller = new AbortController();
                    const fetchedContents = await Promise.all(
                        missingFiles.map(f => fetchFileContent(repoInfo.owner, repoInfo.repo, f.path, controller.signal))
                    );
                    const newContents = {};
                    missingFiles.forEach((f, i) => newContents[f.path] = fetchedContents[i]);
                    setOpenFilesContents(prev => ({ ...prev, ...newContents }));
                    missingFiles.forEach((f, i) => openFilesContents[f.path] = fetchedContents[i]);
                }
                
                finalContext = selectedFiles.map(f => {
                    const content = f.path === activeEditorFile?.path ? editedContent : openFilesContents[f.path];
                    return `// --- Start File: ${f.path} ---\n${content}\n// --- End File: ${f.path} ---\n`;
                }).join('\n');
                finalPath = "Multiple Files Selected";
                
                if (tabName !== 'docs' && tabName !== 'debug') {
                     setAnalysis(prev => ({ ...prev, [tabName]: `*Analyzing ${selectedFiles.length} files cross-contextually...*\n\n` }));
                }
            }

            let result;
            switch(tabName) {
                case 'explanation':
                    setAnalysis(prev => ({ ...prev, explanation: '' }));
                    await streamGemini(
                        prompts.generalExplanation(finalPath, finalContext, question),
                        (chunk) => {
                            setAnalysis(prev => ({ ...prev, explanation: (prev.explanation || '') + chunk }));
                        },
                        'chat'
                    );
                    break;
                case 'mindmap':
                    result = await callGemini(prompts.mindMap(finalPath, finalContext), true, 'logic');
                    setAnalysis(prev => ({ ...prev, mindMapData: result }));
                    break;
                case 'quality':
                    result = await callGemini(prompts.codeQuality(finalPath, finalContext), true, 'logic');
                    setAnalysis(prev => ({ ...prev, quality: result }));
                    break;
                case 'comment':
                    result = await callGemini(prompts.autoComment(finalContext), false, 'logic');
                    setEditedContent(result);
                    break;
                case 'tests':
                    const lang = finalPath.split('.').pop() || 'js';
                    result = await callGemini(prompts.unitTests(finalContext, lang), false, 'logic');
                    setAnalysis(prev => ({ ...prev, testCode: result }));
                    break;
                case 'docs':
                    const docType = question;
                    if (!docType) {
                        setAnalysis(prev => ({ ...prev, docContent: null }));
                        setIsTabLoading(false);
                        return;
                    }
                    const docPrompt = prompts.docs[docType];
                    if (!docPrompt) throw new Error("Unknown documentation type");
                    result = await callGemini(docPrompt(finalPath, finalContext), false, 'logic');
                    if (docType === 'jsdoc') {
                        setEditedContent(result);
                        setAnalysis(prev => ({ ...prev, docContent: '✅ JSDoc comments have been added to the code in the editor above.' }));
                    } else {
                        setAnalysis(prev => ({ ...prev, docContent: result }));
                    }
                    break;
                case 'debug':
                    const { mode, input } = question;
                    if (!mode) {
                        setAnalysis(prev => ({ ...prev, debugResult: null }));
                        setIsTabLoading(false);
                        return;
                    }
                    const debugPrompt = prompts.debug[mode];
                    if (!debugPrompt) throw new Error("Unknown debug mode");
                    result = await callGemini(debugPrompt(finalContext, input), false, 'incident');
                    setAnalysis(prev => ({ ...prev, debugResult: result }));
                    break;
                case 'diff':
                    const { original: originalCode, modified: newCode } = question;
                    if (!originalCode && !newCode) {
                        setAnalysis(prev => ({ ...prev, diffResult: null }));
                        setIsTabLoading(false);
                        return;
                    }
                    result = await callGemini(prompts.diff(originalCode, newCode), false, 'logic');
                    setAnalysis(prev => ({ ...prev, diffResult: result }));
                    break;
                case 'architecture': {
                    if (!repoInfo) {
                        throw new Error('Load a GitHub repository first to generate an architecture diagram.');
                    }
                    // Clear previous result so loading state shows
                    setAnalysis(prev => ({ ...prev, architecture: null }));
                    const treeJson = JSON.stringify(fileTree, null, 2);
                    const response = await fetch('http://localhost:3001/api/rag/dfd', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            owner: repoInfo.owner,
                            repo: repoInfo.repo,
                            fileTree: treeJson
                        })
                    });
                    if (!response.ok) {
                        const errData = await response.json().catch(() => ({}));
                        throw new Error(errData.error || 'Backend returned an error generating the diagram.');
                    }
                    const data = await response.json();
                    if (!data.result) throw new Error('AI returned an empty diagram. Please try again.');
                    setAnalysis(prev => ({ ...prev, architecture: data.result }));
                    break;
                }
                default:
                    throw new Error("Unknown analysis type");
            }
        } catch (err) {
             setError(err.message);
        } finally {
            setIsTabLoading(false);
        }
    };

    const [snippetPopup, setSnippetPopup] = useState(null);
    const [selectedSnippet, setSelectedSnippet] = useState('');
    const [snippetExplanation, setSnippetExplanation] = useState('');
    const [isSnippetLoading, setIsSnippetLoading] = useState(false);

    const handleMouseUp = (e) => {
        if (snippetPopupRef.current?.contains(e.target)) return;
        const selection = window.getSelection();
        const text = selection.toString().trim();
        if (text && codeViewerRef.current?.contains(selection.anchorNode)) {
            setSelectedSnippet(text);
            setSnippetExplanation('');
            setSnippetPopup({ left: e.clientX + 15, top: e.clientY });
        } else {
            setSnippetPopup(null);
        }
    };

    const handleExplainSnippet = async () => {
        if (!selectedSnippet) return;
        setIsSnippetLoading(true);
        try {
            const result = await callGemini(prompts.snippetExplanation(selectedSnippet));
            setSnippetExplanation(result);
        } catch (err) {
            setSnippetExplanation(`Error: ${err.message}`);
        } finally {
            setIsSnippetLoading(false);
        }
    };
    
    return (
        <div className="bg-[#1e1e1e] text-[#cccccc] h-screen overflow-hidden font-sans flex flex-col selection:bg-[#264f78]">
            {/* VS Code Title Bar */}
            <header className="bg-[#181818] h-8 flex items-center justify-between px-3 border-b border-[#2b2b2b] shrink-0 select-none z-[100] relative">
                {/* Menu Items */}
                <div className="flex items-center gap-3 text-[13px]">
                    <button className="md:hidden p-1 hover:bg-white/10 rounded text-[#cccccc]" onClick={() => setIsSidebarOpen(true)}>
                        <Menu size={16} />
                    </button>
                    <div className="hidden md:flex items-center justify-center w-5 h-5 text-blue-500">
                        <Code size={14} />
                    </div>
                    {/* VS Code Menu Bar */}
                    <div className="hidden md:flex gap-0 text-[#cccccc] relative" ref={menuBarRef}>
                        {[  
                            { name: 'File', items: [
                                { label: '📂  Open Repository', action: () => { setIsSidebarOpen(true); setActiveMenu(null); } },
                                { label: '🔍  Load Repo from URL', action: () => { handleLoadRepo(); setActiveMenu(null); } },
                                { label: '🧠  Build Knowledge Base', action: () => { handleIndexWorkspace(); setActiveMenu(null); } },
                                { label: '⬇️  Download File', action: () => { handleDownloadFile && handleDownloadFile(); setActiveMenu(null); }, disabled: !activeEditorFile },
                                { separator: true },
                                { label: '🚪  Sign Out', action: () => { logout(); setActiveMenu(null); } },
                            ]},
                            { name: 'Edit', items: [
                                { label: '🔍  Find in File', action: () => { codeViewerRef.current?.querySelector('textarea')?.focus(); setActiveMenu(null); } },
                                { label: '📋  Select All', action: () => { const ta = codeViewerRef.current?.querySelector('textarea'); if(ta){ta.select();} setActiveMenu(null); } },
                            ]},
                            { name: 'Selection', items: [
                                { label: '🖊️  Select All Text', action: () => { const ta = codeViewerRef.current?.querySelector('textarea'); if(ta){ta.select();} setActiveMenu(null); } },
                            ]},
                            { name: 'View', items: [
                                { label: `${isSidebarOpen ? '⬅️  Hide' : '➡️  Show'} Explorer`, action: () => { setIsSidebarOpen(v => !v); setActiveMenu(null); } },
                                { label: '🎨  Toggle Theme Panel', action: () => { setActiveTab('workspace'); setActiveMenu(null); } },
                            ]},
                            { name: 'Go', items: [
                                { label: '🏠  Go to Home', action: () => { navigate('/'); setActiveMenu(null); } },
                                { label: '📄  Go to Docs', action: () => { navigate('/docs'); setActiveMenu(null); } },
                            ]},
                            { name: 'Run', items: [
                                { label: '⚡  Analyze Code Quality', action: () => { setActiveTab('quality'); setActiveMenu(null); } },
                                { label: '🧪  Generate Tests', action: () => { setActiveTab('tests'); setActiveMenu(null); } },
                                { label: '🐛  Debug Current File', action: () => { setActiveTab('debug'); setActiveMenu(null); } },
                                { label: '🔥  Run Incident Debugger', action: () => { setActiveTab('incident'); setActiveMenu(null); } },
                            ]},
                            { name: 'Terminal', items: [
                                { label: '💻  Workspace Intelligence', action: () => { setActiveTab('workspace'); setActiveMenu(null); } },
                                { label: '🗺️  Generate Mind Map', action: () => { setActiveTab('mindmap'); setActiveMenu(null); } },
                                { label: '✍️  Auto Comment Code', action: () => { setActiveTab('comment'); setActiveMenu(null); } },
                            ]},
                            { name: 'Help', items: [
                                { label: '📖  Documentation', action: () => { navigate('/docs'); setActiveMenu(null); } },
                                { label: '🚀  Connect Private Repo', action: () => { setIsSidebarOpen(true); setActiveMenu(null); } },
                                { label: '💡  About Companion AI', action: () => { navigate('/'); setActiveMenu(null); } },
                            ]},
                        ].map(menu => (
                            <div key={menu.name} className="relative">
                                <span 
                                    className={`px-2 py-0.5 text-[13px] rounded cursor-pointer transition-colors ${activeMenu === menu.name ? 'bg-[#094771] text-white' : 'hover:bg-white/10'}`}
                                    onClick={() => setActiveMenu(prev => prev === menu.name ? null : menu.name)}
                                >
                                    {menu.name}
                                </span>
                                {activeMenu === menu.name && (
                                    <div className="absolute top-full left-0 mt-0.5 bg-[#252526] border border-[#454545] shadow-2xl z-[100] py-1 min-w-[220px]">
                                        {menu.items.map((item, idx) =>
                                            item.separator 
                                                ? <div key={idx} className="my-1 border-t border-[#454545]" />
                                                : <button 
                                                    key={idx}
                                                    onClick={item.action}
                                                    disabled={item.disabled}
                                                    className="w-full text-left px-4 py-1.5 text-[13px] text-[#cccccc] hover:bg-[#094771] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed block"
                                                >
                                                    {item.label}
                                                  </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Title centered */}
                <div className="absolute left-1/2 -translate-x-1/2 text-[12px] hidden sm:flex items-center gap-2">
                    {activeEditorFile ? activeEditorFile.path.split('/').pop() : 'Companion AI'} - Visual Studio Code
                </div>

                {/* Window Controls / Links */}
                <div className="flex items-center gap-2">
                    <Link to="/" className="text-[12px] hover:text-white mr-2 hover:bg-white/10 px-2 py-0.5 rounded transition-colors">Home</Link>
                    <Link to="/docs" className="text-[12px] hover:text-white sm:mr-4 hover:bg-white/10 px-2 py-0.5 rounded transition-colors">Docs</Link>
                    <div className="hidden sm:flex gap-1.5 opacity-50">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                    </div>
                </div>
            </header>
            
            <main className="flex flex-1 overflow-hidden relative">
                {/* Mobile Sidebar Overlay - sits BELOW the sidebar (z-40) */}
                <div 
                    className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-300 ${isMobile && isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                    onClick={() => setIsSidebarOpen(false)} 
                />

                {/* VS Code Activity Bar */}
                <div className="hidden md:flex w-12 bg-[#181818] flex-col items-center py-2 shrink-0 z-10 border-r border-[#2b2b2b]">
                    <div className="p-2.5 text-white/40 hover:text-white cursor-pointer relative text-white">
                        <Files size={24} strokeWidth={1.5}/>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-full bg-[#007acc]"></div>
                    </div>
                    <div className="p-2.5 text-white/40 hover:text-white cursor-pointer"><Search size={24} strokeWidth={1.5}/></div>
                    <div className="p-2.5 text-white/40 hover:text-white cursor-pointer"><GitBranch size={24} strokeWidth={1.5}/></div>
                    <div className="p-2.5 text-white/40 hover:text-white cursor-pointer"><Command size={24} strokeWidth={1.5}/></div>
                    <div className="mt-auto p-2.5 text-white/40 hover:text-white cursor-pointer"><UserIcon size={24} strokeWidth={1.5}/></div>
                    <div className="p-2.5 text-white/40 hover:text-white cursor-pointer" onClick={logout}><Settings size={24} strokeWidth={1.5}/></div>
                </div>

                {/* Left Sidebar - fixed on mobile (z-50 so it's above the overlay at z-40) */}
                <aside 
                    className={`${isMobile ? 'fixed top-0 left-0 h-full' : 'relative h-full'} 
                        ${isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
                        transition-transform duration-300 ease-in-out bg-[#252526] flex flex-col overflow-hidden flex-shrink-0 
                        ${isMobile ? 'z-50 w-[85%]' : 'z-10'} border-r border-[#2b2b2b]`}
                    style={!isMobile ? { flexBasis: `${leftPanelWidth}%` } : {}}
                >
                    {/* Explorer Header */}
                    <div className="px-5 py-3 text-[11px] text-[#cccccc] uppercase tracking-wide flex justify-between items-center">
                        EXPLORER
                        <div className="md:hidden flex items-center gap-3">
                            <button className="p-1 hover:bg-white/10 rounded" onClick={logout} title="Logout">
                                <LogOut size={14} />
                            </button>
                            <button className="p-1 hover:bg-white/10 rounded" onClick={() => setIsSidebarOpen(false)}>
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col h-full overflow-hidden">
                        {/* Action Panel (Like an accordion section) */}
                        <div className="px-4 pb-4 space-y-4 border-b border-[#2b2b2b]">
                            {/* Repo Loader */}
                            <div className="space-y-1.5">
                                <div className="text-[10px] font-semibold text-[#cccccc]">REPOSITORY</div>
                                <div className="relative group">
                                    <input 
                                        type="text" 
                                        value={repoUrl} 
                                        onChange={(e) => setRepoUrl(e.target.value)} 
                                        onKeyPress={(e) => e.key === 'Enter' && handleLoadRepo()} 
                                        placeholder="Paste GitHub URL..." 
                                        className="w-full pl-2 pr-8 py-1.5 bg-[#3c3c3c] border border-transparent focus:border-[#007acc] outline-none text-xs text-[#cccccc] transition-all"
                                    />
                                    <button 
                                        onClick={handleLoadRepo}
                                        disabled={isLoading || !repoUrl}
                                        className="absolute right-1 top-1 p-0.5 text-[#cccccc] hover:bg-[#505050] rounded disabled:opacity-50"
                                    >
                                        <Search size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Neural Indexing */}
                            <div className="space-y-1.5">
                                <div className="text-[10px] font-semibold text-[#cccccc]">AI INDEXING</div>
                                <button 
                                    onClick={handleIndexWorkspace} 
                                    disabled={isIndexing || !repoInfo} 
                                    className={`w-full py-1.5 rounded flex items-center justify-center gap-1.5 text-xs font-medium transition-all ${isIndexComplete ? 'bg-[#007acc]/20 text-[#007acc] border border-[#007acc]/50' : 'bg-[#007acc] text-white hover:bg-[#0062a3]'}`}
                                >
                                    {isIndexing ? 'Indexing...' : isIndexComplete ? 'Knowledge Base Ready' : 'Build Knowledge Base'}
                                </button>
                            </div>
                        </div>

                        {/* File Tree */}
                        <div className="flex-1 flex flex-col min-h-0 pt-2">
                            <div className="px-4 text-[10px] font-semibold text-[#cccccc] mb-2 uppercase flex items-center justify-between">
                                WORKSPACE
                                <Info size={12} className="cursor-help opacity-50 hover:opacity-100" />
                            </div>
                            <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
                                {isLoading && Object.keys(fileTree).length === 0 ? <Loader/> : <FileTree tree={fileTree} onFileClick={handleFileClick} onToggleSelect={handleToggleSelect} selectedFiles={selectedFiles} />}
                            </div>
                        </div>
                    </div>
                </aside>
                
                {/* Horizontal Resizer */}
                <div 
                    onMouseDown={startVerticalResize}
                    className="hidden md:flex w-1 flex-shrink-0 cursor-col-resize bg-transparent hover:bg-[#007acc] transition-colors duration-200 z-10"
                />
                
                {/* Main Content Area */}
                <section ref={mainContentRef} className="flex-1 flex flex-col relative bg-[#1e1e1e] overflow-hidden">
                    {/* Editor Panel — rigid slice: flex-basis holds the % and flex-shrink:0 prevents collapse */}
                    <div 
                        className="overflow-hidden flex flex-col bg-[#1e1e1e] flex-shrink-0"
                        style={{ flexBasis: `${topPanelHeight}%` }}
                        onMouseUp={handleMouseUp}
                    >
                        <EditorTabs 
                            selectedFiles={selectedFiles} 
                            activeEditorFile={activeEditorFile} 
                            onTabClick={handleFileClick} 
                            onCloseTab={handleCloseTab} 
                        />
                        <div className="flex-1 overflow-hidden relative border-b border-[#2b2b2b]">
                             <CodeViewer 
                                ref={codeViewerRef} 
                                file={activeEditorFile} 
                                editedContent={editedContent}
                                onContentChange={handleContentChange}
                                onDownload={handleDownloadFile}
                            />
                        </div>
                    </div>

                    {/* Horizontal Resizer — 4px touch target, shrink-0 so it never squeezes */}
                    <div 
                        onMouseDown={startHorizontalResize}
                        className="h-1 flex-shrink-0 cursor-row-resize bg-[#2b2b2b] hover:bg-[#007acc] transition-colors duration-200 z-10"
                    />

                    {/* Intelligence / Terminal Panel — explicit height so content can never push the editor */}
                    <div 
                        className="flex flex-col bg-[#1e1e1e] overflow-hidden"
                        style={{ height: `calc(${100 - topPanelHeight}% - 4px)` }}
                    >
                        <Tabs 
                            activeTab={activeTab} 
                            setActiveTab={setActiveTab} 
                            analysis={analysis} 
                            isLoading={isTabLoading} 
                            onGenerate={handleGenerateForTab} 
                            onAsk={(q) => activeTab === 'workspace' ? handleWorkspaceAsk(q) : handleGenerateForTab('explanation', q)} 
                            error={error} 
                            currentEditorCode={editedContent}
                            isIndexComplete={isIndexComplete}
                            repoInfo={repoInfo}
                            hasOpenFile={!!activeEditorFile}
                        />
                    </div>
                </section> 
            </main>
            
            {/* VS Code Status Bar */}
            <footer className="h-[22px] bg-[#007acc] flex items-center justify-between px-3 text-white text-[11px] shrink-0 select-none z-50">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 hover:bg-white/20 px-1 py-0.5 cursor-pointer rounded">
                        <GitBranch size={12} /> main
                    </div>
                    <div className="flex items-center gap-1 hover:bg-white/20 px-1 py-0.5 cursor-pointer rounded">
                        <Globe size={12} /> Cloud Sync Active
                    </div>
                    <div className="flex items-center gap-1 hover:bg-white/20 px-1 py-0.5 cursor-pointer rounded">
                        <ShieldCheck size={12} /> Secure Mode
                    </div>
                    {user && (
                         <div className="flex items-center gap-1 hover:bg-white/20 px-1 py-0.5 cursor-pointer rounded" onClick={logout}>
                             <LogOut size={12} /> Logout
                         </div>
                    )}
                </div>
                <div className="hidden md:flex items-center gap-3">
                    <div className="flex items-center gap-1 hover:bg-white/20 px-1 py-0.5 cursor-pointer rounded">
                        Ln 1, Col 1
                    </div>
                    <div className="flex items-center gap-1 hover:bg-white/20 px-1 py-0.5 cursor-pointer rounded">
                        Spaces: 4
                    </div>
                    <div className="flex items-center gap-1 hover:bg-white/20 px-1 py-0.5 cursor-pointer rounded">
                        UTF-8
                    </div>
                    <div className="flex items-center gap-1 hover:bg-white/20 px-1 py-0.5 cursor-pointer rounded">
                        CRLF
                    </div>
                    <div className="flex items-center gap-1 hover:bg-white/20 px-1 py-0.5 cursor-pointer rounded uppercase">
                        {activeEditorFile ? activeEditorFile.path.split('.').pop() : 'PlainText'}
                    </div>
                </div>
            </footer>
            
            {/* Snippet Popup */}
            <SnippetPopup 
                ref={snippetPopupRef} 
                initialPosition={snippetPopup} 
                explanation={snippetExplanation} 
                isLoading={isSnippetLoading} 
                onClose={() => setSnippetPopup(null)} 
                onExplain={handleExplainSnippet} 
            />
            
            <style>
                {`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 10px;
                    height: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.2);
                }
                `}
            </style>
        </div>
    );
};

export default Codeview;
