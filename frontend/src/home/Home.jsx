import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { 
  Menu, X, ChevronDown, PanelLeft, ChevronLeft, ChevronRight, 
  Monitor, RotateCw, Share, Plus, Copy, Grid, Compass, 
  Layers, ListTodo, Sparkles, ArrowUp, ShieldCheck, Terminal, 
  Globe, CheckCircle2, MessageSquare, Check, Code, Bug, 
  TrendingUp, ChevronUp,
  Files, Search, GitBranch, Play, LayoutGrid, User, Settings, 
  Folder, FileCode, File, FileJson, FileText, MousePointer2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/AuthContext';
import AuthModal from '../shared/AuthModal';

const Logo = ({ className = "" }) => (
  <svg 
    viewBox="0 0 256 256" 
    className={className} 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M 144 256 L 27.598 256 L 144 139.598 Z M 256 207.5 L 200 256 L 200 56 L 0 56 L 48 0 L 256 0 Z M 0 204.402 L 0 112 L 92.402 112 Z" />
  </svg>
);

const Navbar = ({ user, logout, setIsAuthModalOpen, navigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="animate-fade-down relative z-[100] px-5 sm:px-8 lg:px-10 py-4 sm:py-5 flex items-center justify-between">
      <div 
        className="flex items-center gap-2 cursor-pointer text-gray-900 relative z-[1000]" 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <Logo className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="font-bold text-lg hidden sm:block tracking-tight text-gray-900">
          AI Code <span className="text-gray-500">Companion</span>
        </span>
      </div>
      
      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-8 text-[13px] text-gray-700 font-medium">
        <Link to="/about" className="hover:text-gray-900 transition-colors">About</Link>
        <Link to="/docs" className="hover:text-gray-900 transition-colors">Docs</Link>
        <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
        <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
      </div>
      
      {/* CTA & Mobile Toggle */}
      <div className="flex items-center gap-3 relative z-[1000]">
        {!user ? (
          <button 
            onClick={() => setIsAuthModalOpen(true)}
            className="text-[13px] font-medium text-gray-700 hover:text-gray-900 hidden sm:block transition-colors"
          >
            Sign In
          </button>
        ) : (
          <button 
            onClick={logout} 
            className="text-[13px] font-medium text-gray-700 hover:text-red-600 hidden sm:block transition-colors"
          >
            Sign Out
          </button>
        )}
        <button 
          onClick={() => user ? navigate('/Codeview') : setIsAuthModalOpen(true)}
          className="bg-gray-900 text-white text-[13px] font-medium px-4 sm:px-5 py-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          {user ? "Launch App" : "Try It Free"}
        </button>
        <button 
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-full text-gray-900 transition-colors relative z-[1000]"
          style={{
            background: '#dde1e7',
            boxShadow: '3px 3px 8px #b8bec9, -3px -3px 8px #ffffff'
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown & Overlay */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[998] md:hidden" 
            style={{ background: '#dde1e7' }}
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute left-4 right-4 top-full mt-3 rounded-2xl px-6 py-5 animate-fade-up z-[999] flex flex-col gap-5"
               style={{
                   background: '#dde1e7',
                   boxShadow: '6px 6px 16px #b8bec9, -6px -6px 16px #ffffff'
               }}>
            <Link to="/about" className="text-[16px] font-bold text-gray-900" onClick={() => setIsOpen(false)}>About</Link>
            <Link to="/docs" className="text-[16px] font-medium text-gray-700 hover:text-gray-900" onClick={() => setIsOpen(false)}>Docs</Link>
            <a href="#features" className="text-[16px] font-medium text-gray-700 hover:text-gray-900" onClick={() => setIsOpen(false)}>Features</a>
            <a href="#faq" className="text-[16px] font-medium text-gray-700 hover:text-gray-900" onClick={() => setIsOpen(false)}>FAQ</a>
            <div className="h-px bg-gray-300/40 w-full my-1"></div>
            {!user ? (
              <button onClick={() => { setIsAuthModalOpen(true); setIsOpen(false); }} className="w-full text-left text-[16px] font-bold text-gray-900">Sign In</button>
            ) : (
              <button onClick={() => { logout(); setIsOpen(false); }} className="w-full text-left text-[16px] font-bold text-red-600">Sign Out</button>
            )}
          </div>
        </>
      )}
    </nav>
  );
};

const ScaledDashboard = ({ children }) => {
  const containerRef = useRef(null);
  const innerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState('auto');

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current && innerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const innerWidth = 896; // design width
        const newScale = Math.min(containerWidth / innerWidth, 1);
        setScale(newScale);
        setHeight(innerRef.current.offsetHeight * newScale);
      }
    };

    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    updateScale();
    if (innerRef.current) {
      resizeObserver.observe(innerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ height, position: 'relative', width: '100%' }}>
      <div 
        ref={innerRef}
        style={{
          width: '896px',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'absolute',
          top: 0,
          left: 0
        }}
      >
        {children}
      </div>
    </div>
  );
};

const DashboardMockup = () => {
  return (
    <div className="rounded-t-2xl overflow-hidden bg-[#181818] shadow-[0_-20px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/10 text-left w-full h-[600px] flex flex-col font-sans">
      {/* Title bar (VS Code style) */}
      <div className="bg-[#181818] border-b border-[#2d2d2d] px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 text-[13px] text-[#cccccc]">
          <div className="flex gap-2.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
          </div>
          <div className="flex gap-4 ml-2 text-[13px] hidden sm:flex">
            <span className="cursor-pointer hover:text-white">File</span>
            <span className="cursor-pointer hover:text-white">Edit</span>
            <span className="cursor-pointer hover:text-white">Selection</span>
            <span className="cursor-pointer hover:text-white">View</span>
            <span className="cursor-pointer hover:text-white">Go</span>
            <span className="cursor-pointer hover:text-white">Run</span>
            <span className="cursor-pointer hover:text-white">Terminal</span>
            <span className="cursor-pointer hover:text-white">Help</span>
          </div>
        </div>
        <div className="text-[13px] text-[#cccccc] font-medium hidden md:block">
          index.ts - Visual Studio Code
        </div>
        <div className="flex gap-4 text-[13px] text-[#cccccc]">
          <span className="cursor-pointer hover:text-white hidden sm:block">Home</span>
          <span className="cursor-pointer hover:text-white hidden sm:block">Docs</span>
          <div className="flex items-center gap-1.5 ml-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <div className="w-12 bg-[#181818] border-r border-[#2d2d2d] flex flex-col items-center py-4 gap-6 text-[#858585] shrink-0">
          <Files className="w-6 h-6 text-white cursor-pointer" />
          <Search className="w-6 h-6 cursor-pointer hover:text-white" />
          <GitBranch className="w-6 h-6 cursor-pointer hover:text-white" />
          <Play className="w-6 h-6 cursor-pointer hover:text-white" />
          <LayoutGrid className="w-6 h-6 cursor-pointer hover:text-white" />
          <div className="mt-auto flex flex-col gap-6">
            <User className="w-6 h-6 cursor-pointer hover:text-white" />
            <Settings className="w-6 h-6 cursor-pointer hover:text-white" />
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-[260px] border-r border-[#2d2d2d] bg-[#181818] flex flex-col text-[#cccccc] shrink-0 overflow-y-auto no-scrollbar">
          <div className="px-5 py-3 text-[11px] font-medium text-[#858585] tracking-wide uppercase">
            Explorer
          </div>
          
          <div className="flex flex-col">
            <div className="px-5 py-1.5 text-[11px] font-bold text-[#cccccc] uppercase flex items-center justify-between">
              REPOSITORY
            </div>
            <div className="px-5 py-2">
              <div className="bg-[#2d2d2d] text-[#cccccc] text-xs px-3 py-1.5 flex items-center justify-between rounded border border-[#3c3c3c]">
                <span className="truncate w-full">https://github.com/Ranjitx000/ai-resume-analyze...</span>
                <Search className="w-3.5 h-3.5 shrink-0 ml-2 text-[#858585]" />
              </div>
            </div>

            <div className="px-5 py-1.5 text-[11px] font-bold text-[#cccccc] uppercase mt-2">
              AI INDEXING
            </div>
            <div className="px-5 pb-4 border-b border-[#2d2d2d]">
              <motion.div 
                animate={{ opacity: [1, 0.5, 1], boxShadow: ["0 0 0px rgba(14,99,156,0)", "0 0 8px rgba(14,99,156,0.6)", "0 0 0px rgba(14,99,156,0)"] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                className="bg-[#0e639c]/20 border border-[#0e639c] text-[#4daafc] text-[11px] px-3 py-1.5 text-center rounded flex items-center justify-center font-medium"
              >
                Knowledge Base Ready
              </motion.div>
            </div>

            <div className="px-5 py-1.5 text-[11px] font-bold text-[#cccccc] uppercase mt-2 flex items-center gap-1 cursor-pointer hover:text-white">
              <ChevronDown className="w-3.5 h-3.5" /> WORKSPACE
            </div>
            
            <div className="flex flex-col text-[13px] py-1">
              <div className="flex items-center gap-2 px-7 py-1 hover:bg-[#2a2d2e] cursor-pointer">
                <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
                <Folder className="w-4 h-4 text-[#dcb67a]" fill="currentColor" />
                <span>app</span>
              </div>
              <div className="flex items-center gap-2 px-7 py-1 hover:bg-[#2a2d2e] cursor-pointer">
                <ChevronDown className="w-3.5 h-3.5 text-[#858585]" />
                <Folder className="w-4 h-4 text-[#dcb67a]" fill="currentColor" />
                <span>content</span>
              </div>
              <div className="flex items-center gap-2 px-12 py-1 bg-[#37373d] text-white border-l border-[#007acc] cursor-pointer">
                <FileCode className="w-4 h-4 text-[#519aba]" />
                <span>index.ts</span>
              </div>
              <div className="flex items-center gap-2 px-7 py-1 hover:bg-[#2a2d2e] cursor-pointer">
                <ChevronRight className="w-3.5 h-3.5 text-[#858585]" />
                <Folder className="w-4 h-4 text-[#dcb67a]" fill="currentColor" />
                <span>public</span>
              </div>
              <div className="flex items-center gap-2 px-10 py-1 hover:bg-[#2a2d2e] cursor-pointer text-[#cccccc]">
                <File className="w-4 h-4 text-[#858585]" />
                <span>.dockerignore</span>
              </div>
              <div className="flex items-center gap-2 px-10 py-1 hover:bg-[#2a2d2e] cursor-pointer text-[#cccccc]">
                <File className="w-4 h-4 text-[#f14e32]" />
                <span>.gitignore</span>
              </div>
              <div className="flex items-center gap-2 px-10 py-1 hover:bg-[#2a2d2e] cursor-pointer text-[#cccccc]">
                <File className="w-4 h-4 text-[#2496ed]" />
                <span>Dockerfile</span>
              </div>
              <div className="flex items-center gap-2 px-10 py-1 hover:bg-[#2a2d2e] cursor-pointer text-[#cccccc]">
                <FileJson className="w-4 h-4 text-[#cbcb41]" />
                <span>package-lock.json</span>
              </div>
              <div className="flex items-center gap-2 px-10 py-1 hover:bg-[#2a2d2e] cursor-pointer text-[#cccccc]">
                <FileJson className="w-4 h-4 text-[#cbcb41]" />
                <span>package.json</span>
              </div>
              <div className="flex items-center gap-2 px-10 py-1 hover:bg-[#2a2d2e] cursor-pointer text-[#cccccc]">
                <FileCode className="w-4 h-4 text-[#519aba]" />
                <span>react-router.config.ts</span>
              </div>
              <div className="flex items-center gap-2 px-10 py-1 hover:bg-[#2a2d2e] cursor-pointer text-[#cccccc]">
                <FileText className="w-4 h-4 text-[#0188d1]" />
                <span>README.md</span>
              </div>
              <div className="flex items-center gap-2 px-10 py-1 hover:bg-[#2a2d2e] cursor-pointer text-[#cccccc]">
                <FileJson className="w-4 h-4 text-[#cbcb41]" />
                <span>tsconfig.json</span>
              </div>
              <div className="flex items-center gap-2 px-10 py-1 hover:bg-[#2a2d2e] cursor-pointer text-[#cccccc]">
                <FileCode className="w-4 h-4 text-[#519aba]" />
                <span>vite.config.ts</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Area */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e] min-w-0">
          {/* Editor Tabs */}
          <div className="flex bg-[#252526] overflow-x-auto no-scrollbar border-b border-[#2d2d2d] shrink-0">
            <div className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-[#858585] border-r border-[#2d2d2d] bg-[#2d2d2d]/50 cursor-pointer hover:bg-[#2d2d2d]/80 transition-colors whitespace-nowrap">
              <FileCode className="w-4 h-4 text-[#519aba]" /> ATS.tsx
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-white bg-[#1e1e1e] border-t border-[#007acc] cursor-pointer whitespace-nowrap">
              <FileCode className="w-4 h-4 text-[#519aba]" /> index.ts <X className="w-3.5 h-3.5 ml-2 hover:bg-[#333333] rounded" />
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 px-4 py-1.5 text-[12px] text-[#cccccc] shadow-sm shrink-0">
            <span className="hover:text-white cursor-pointer">Companion</span> <ChevronRight className="w-3.5 h-3.5 text-[#858585]" /> <span className="hover:text-white cursor-pointer">content</span> <ChevronRight className="w-3.5 h-3.5 text-[#858585]" /> <span className="hover:text-white cursor-pointer">index.ts</span>
          </div>

          {/* Code Editor */}
          <div className="p-4 font-mono text-[14px] leading-6 border-b border-[#2d2d2d] h-[180px] overflow-hidden shrink-0">
            <div className="text-[#c586c0]">export const <span className="text-[#4fc1ff]">resumes</span>: <span className="text-[#4ec9b0]">Resume</span>[] = [</div>
            <div className="pl-4 text-[#d4d4d4]">{"{"}</div>
            <div className="pl-8"><span className="text-[#9cdcfe]">id</span>: <span className="text-[#ce9178]">"1"</span>,</div>
            <div className="pl-8"><span className="text-[#9cdcfe]">companyName</span>: <span className="text-[#ce9178]">"Google"</span>,</div>
            <div className="pl-8"><span className="text-[#9cdcfe]">jobTitle</span>: <span className="text-[#ce9178]">"Frontend Developer"</span>,</div>
            <div className="pl-8"><span className="text-[#9cdcfe]">imagePath</span>: <span className="text-[#ce9178]">"/images/resume_01.png"</span>,</div>
            <div className="pl-8"><span className="text-[#9cdcfe]">resumePath</span>: <span className="text-[#ce9178]">"/resumes/resume-1.pdf"</span>,</div>
            <div className="pl-4 text-[#d4d4d4]">
              {"},"}
              <motion.span 
                animate={{ opacity: [1, 0, 1] }} 
                transition={{ repeat: Infinity, duration: 1, ease: "steps(2)" }}
                className="inline-block w-2 h-4 bg-[#cccccc] ml-1 align-middle"
              />
            </div>
          </div>

          {/* Feature Tabs Bar */}
          <div className="flex items-center justify-between bg-[#181818] border-b border-[#2d2d2d] px-4 shrink-0 overflow-x-auto no-scrollbar relative z-10">
            <div className="flex gap-6 text-[10px] font-bold text-[#858585] uppercase tracking-wider h-11 whitespace-nowrap">
              <div className="flex items-center h-full hover:text-white transition-colors cursor-pointer">WORKSPACE</div>
              <div className="flex items-center h-full hover:text-white transition-colors cursor-pointer">INCIDENT</div>
              <div className="flex items-center h-full hover:text-white transition-colors cursor-pointer">ASSISTANT</div>
              <div className="flex items-center h-full text-white border-b-[3px] border-[#0e639c] cursor-pointer px-1 relative">
                MIND MAP
                {/* Arrow pointing to mind map like in image */}
                <motion.div 
                  animate={{ y: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="absolute top-11 left-1/2 w-[1.5px] h-[70px] bg-red-500 origin-top rotate-[25deg] z-10 pointer-events-none after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:translate-y-[2px] after:w-2 after:h-2 after:bg-red-500 after:rotate-45" 
                />
              </div>
              <div className="flex items-center h-full hover:text-white transition-colors cursor-pointer">CODE QUALITY</div>
              <div className="flex items-center h-full hover:text-white transition-colors cursor-pointer">AUTO COMMENT</div>
              <div className="flex items-center h-full hover:text-white transition-colors cursor-pointer">GENERATE TESTS</div>
              <div className="flex items-center h-full hover:text-white transition-colors cursor-pointer">DOCS</div>
              <div className="flex items-center h-full hover:text-white transition-colors cursor-pointer">DEBUG</div>
              <div className="flex items-center h-full hover:text-white transition-colors cursor-pointer">DIFF</div>
            </div>
            <button className="bg-[#0e639c] hover:bg-[#1177bb] transition-colors text-white text-[12px] px-4 py-1.5 rounded flex items-center font-medium ml-4 shrink-0">
              Generate
            </button>
          </div>

          {/* Mind Map Area */}
          <div className="flex-1 bg-[#0d0d12] relative overflow-hidden flex items-center justify-center p-6 min-h-[300px]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a2a35_1px,transparent_1px),linear-gradient(to_bottom,#2a2a35_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
            
            {/* Mind Map visualization */}
            <div className="relative w-full h-full max-w-[700px] flex items-center justify-center">
              {/* Dummy SVG for lines and nodes */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: 'drop-shadow(0 0 8px rgba(108,63,245,0.2))' }}>
                {/* Base paths */}
                <motion.path d="M150,150 C200,150 200,70 250,70" fill="none" stroke="#4c4c6d" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
                <motion.path d="M150,150 C200,150 200,150 250,150" fill="none" stroke="#4c4c6d" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
                <motion.path d="M150,150 C200,150 200,230 250,230" fill="none" stroke="#4c4c6d" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} />
                
                <motion.path d="M350,70 C390,70 390,40 430,40" fill="none" stroke="#4c4c6d" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.2 }} />
                <motion.path d="M350,70 C390,70 390,70 430,70" fill="none" stroke="#4c4c6d" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.2 }} />
                <motion.path d="M350,70 C390,70 390,100 430,100" fill="none" stroke="#4c4c6d" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.2 }} />
                
                <motion.path d="M350,150 C390,150 390,150 430,150" fill="none" stroke="#4c4c6d" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.2 }} />
                
                <motion.path d="M350,230 C390,230 390,190 430,190" fill="none" stroke="#4c4c6d" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.2 }} />
                <motion.path d="M350,230 C390,230 390,230 430,230" fill="none" stroke="#4c4c6d" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.2 }} />
                <motion.path d="M350,230 C390,230 390,270 430,270" fill="none" stroke="#4c4c6d" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.2 }} />
                <motion.path d="M350,230 C390,230 390,310 430,310" fill="none" stroke="#4c4c6d" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.2 }} />

                {/* Flowing data animations */}
                <motion.path d="M150,150 C200,150 200,70 250,70" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="15 100" animate={{ strokeDashoffset: [115, -115] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} />
                <motion.path d="M350,70 C390,70 390,70 430,70" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="15 100" animate={{ strokeDashoffset: [115, -115] }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.5 }} />
                <motion.path d="M150,150 C200,150 200,230 250,230" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="15 100" animate={{ strokeDashoffset: [115, -115] }} transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }} />
              </svg>
              
              {/* Nodes */}
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.4, delay: 0.1 }} className="absolute left-[30px] top-[140px] px-3 py-1.5 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-[10px] flex items-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.3)] backdrop-blur-sm transition-transform hover:scale-105 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> resume-analyzer
              </motion.div>

              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.4, delay: 0.2 }} className="absolute left-[250px] top-[60px] px-3 py-1.5 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-[10px] flex items-center gap-2 backdrop-blur-sm transition-transform hover:scale-105 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> optimizedResumeFlow
              </motion.div>
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.4, delay: 0.3 }} className="absolute left-[250px] top-[140px] px-3 py-1.5 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-300 text-[10px] flex items-center gap-2 backdrop-blur-sm transition-transform hover:scale-105 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> ui
              </motion.div>
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.4, delay: 0.4 }} className="absolute left-[250px] top-[220px] px-3 py-1.5 rounded-full bg-purple-600/20 border border-purple-500/40 text-purple-300 text-[10px] flex items-center gap-2 backdrop-blur-sm transition-transform hover:scale-105 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div> authController
              </motion.div>

              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.4, delay: 0.3 }} className="absolute left-[430px] top-[30px] px-3 py-1.5 rounded-full bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-[10px] flex items-center gap-2 backdrop-blur-sm transition-transform hover:scale-105 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> index.ts
              </motion.div>
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.4, delay: 0.4 }} className="absolute left-[430px] top-[60px] px-3 py-1.5 rounded-full bg-orange-600/20 border border-orange-500/40 text-orange-300 text-[10px] flex items-center gap-2 backdrop-blur-sm transition-transform hover:scale-105 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div> Types
              </motion.div>
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.4, delay: 0.5 }} className="absolute left-[430px] top-[90px] px-3 py-1.5 rounded-full bg-yellow-600/20 border border-yellow-500/40 text-yellow-300 text-[10px] flex items-center gap-2 backdrop-blur-sm transition-transform hover:scale-105 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div> Utilities
              </motion.div>
              
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.4, delay: 0.4 }} className="absolute left-[430px] top-[140px] px-3 py-1.5 rounded-full bg-orange-600/20 border border-orange-500/40 text-orange-300 text-[10px] flex items-center gap-2 backdrop-blur-sm transition-transform hover:scale-105 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div> Components
              </motion.div>

              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.4, delay: 0.5 }} className="absolute left-[430px] top-[180px] px-3 py-1.5 rounded-full bg-purple-600/20 border border-purple-500/40 text-purple-300 text-[10px] flex items-center gap-2 backdrop-blur-sm transition-transform hover:scale-105 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div> login
              </motion.div>
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.4, delay: 0.6 }} className="absolute left-[430px] top-[220px] px-3 py-1.5 rounded-full bg-purple-600/20 border border-purple-500/40 text-purple-300 text-[10px] flex items-center gap-2 backdrop-blur-sm transition-transform hover:scale-105 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div> register
              </motion.div>
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.4, delay: 0.7 }} className="absolute left-[430px] top-[260px] px-3 py-1.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 text-[10px] flex items-center gap-2 backdrop-blur-sm transition-transform hover:scale-105 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div> jwtMiddleware
              </motion.div>
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.4, delay: 0.8 }} className="absolute left-[430px] top-[300px] px-3 py-1.5 rounded-full bg-green-600/20 border border-green-500/40 text-green-300 text-[10px] flex items-center gap-2 backdrop-blur-sm transition-transform hover:scale-105 cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div> authRoutes
              </motion.div>
            </div>

            <div className="absolute bottom-4 right-4 bg-[#1e1e1e] border border-[#2d2d2d] rounded px-3 py-1.5 text-[11px] text-[#cccccc] flex items-center gap-2 shadow-lg">
              <MousePointer2 className="w-3.5 h-3.5" /> Scroll to zoom · Drag to pan
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// NeumorphicCursor — dual-layer clay cursor with spring follower
const NeumorphicCursor = () => {
  const dotRef   = useRef(null);
  const ringRef  = useRef(null);
  const pos      = useRef({ x: -100, y: -100 });
  const follower = useRef({ x: -100, y: -100 });
  const isHover  = useRef(false);
  const rafId    = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    const onEnter = () => {
      isHover.current = true;
      if (dotRef.current) {
        dotRef.current.style.boxShadow =
          'inset 3px 3px 8px rgba(184,190,201,0.85), inset -3px -3px 8px rgba(255,255,255,0.9)';
      }
      if (ringRef.current) {
        ringRef.current.style.width  = '52px';
        ringRef.current.style.height = '52px';
        ringRef.current.style.boxShadow =
          'inset 5px 5px 14px rgba(184,190,201,0.7), inset -5px -5px 14px rgba(255,255,255,0.85)';
      }
    };

    const onLeave = () => {
      isHover.current = false;
      if (dotRef.current) {
        dotRef.current.style.boxShadow =
          '4px 4px 10px rgba(184,190,201,0.8), -4px -4px 10px rgba(255,255,255,0.9)';
      }
      if (ringRef.current) {
        ringRef.current.style.width  = '38px';
        ringRef.current.style.height = '38px';
        ringRef.current.style.boxShadow =
          '5px 5px 14px rgba(184,190,201,0.65), -5px -5px 14px rgba(255,255,255,0.8)';
      }
    };

    const loop = () => {
      // Lerp follower toward dot (spring feel)
      follower.current.x += (pos.current.x - follower.current.x) * 0.12;
      follower.current.y += (pos.current.y - follower.current.y) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate(${follower.current.x}px, ${follower.current.y}px) translate(-50%,-50%)`;
      }
      // Dot position + scale written together every frame
      if (dotRef.current) {
        const scale = isHover.current ? ' scale(0.7)' : ' scale(1)';
        dotRef.current.style.transform =
          `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%,-50%)${scale}`;
      }
      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);

    // WeakSet prevents duplicate listeners when MutationObserver re-fires
    const registered = new WeakSet();
    const interactives = 'a, button, input, textarea, [role="button"], label, select';
    const addListeners = () => {
      document.querySelectorAll(interactives).forEach(el => {
        if (registered.has(el)) return;
        registered.add(el);
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
      });
    };
    addListeners();
    const observer = new MutationObserver(addListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId.current);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Dot — snaps instantly, convex extruded */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed', top: 0, left: 0, zIndex: 99999,
          width: '12px', height: '12px',
          borderRadius: '50%',
          background: '#dde1e7',
          boxShadow: '4px 4px 10px rgba(184,190,201,0.8), -4px -4px 10px rgba(255,255,255,0.9)',
          pointerEvents: 'none',
          willChange: 'transform',
          transition: 'box-shadow 0.25s ease, transform 0.15s ease',
        }}
      />
      {/* Ring — spring follower, concave */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed', top: 0, left: 0, zIndex: 99998,
          width: '38px', height: '38px',
          borderRadius: '50%',
          background: '#dde1e7',
          boxShadow: '5px 5px 14px rgba(184,190,201,0.65), -5px -5px 14px rgba(255,255,255,0.8)',
          pointerEvents: 'none',
          willChange: 'transform',
          transition: 'width 0.35s cubic-bezier(0.23,1,0.32,1), height 0.35s cubic-bezier(0.23,1,0.32,1), box-shadow 0.35s ease',
        }}
      />
    </>
  );
};

// Card3D: mouse-tracking 3D tilt with specular glare
const Card3D = ({ children, className = "", delay = 0 }) => {
  const cardRef = useRef(null);
  const glareRef = useRef(null);
  const [style, setStyle] = useState({});
  const [glareStyle, setGlareStyle] = useState({});
  const [isHovered, setIsHovered] = useState(false);
  const animFrameRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(() => {
      const rect = cardRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const maxTilt = 14;
      const rotX = (-dy / (rect.height / 2)) * maxTilt;
      const rotY = (dx / (rect.width / 2)) * maxTilt;

      // Glare position (0..1)
      const glareX = ((e.clientX - rect.left) / rect.width) * 100;
      const glareY = ((e.clientY - rect.top) / rect.height) * 100;

      setStyle({
        transform: `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.04,1.04,1.04)`,
        transition: 'transform 0.08s linear',
        boxShadow: `${-rotY * 1.2}px ${rotX * 1.2}px 40px rgba(99,102,241,0.18), 0 20px 60px rgba(0,0,0,0.12)`,
      });
      setGlareStyle({
        background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.32) 0%, transparent 65%)`,
        opacity: 1,
      });
    });
  };

  const handleMouseLeave = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setStyle({
      transform: 'perspective(700px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)',
      transition: 'transform 0.55s cubic-bezier(0.23,1,0.32,1), box-shadow 0.55s cubic-bezier(0.23,1,0.32,1)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    });
    setGlareStyle({ opacity: 0, transition: 'opacity 0.55s' });
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      variants={{
        hidden: { opacity: 0, y: 40, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay } }
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ ...style, willChange: 'transform', transformStyle: 'preserve-3d' }}
      className={`relative rounded-3xl bg-white border border-gray-200 overflow-hidden cursor-pointer ${className}`}
    >
      {/* Specular glare layer */}
      <div
        ref={glareRef}
        style={{
          ...glareStyle,
          position: 'absolute', inset: 0, zIndex: 20,
          pointerEvents: 'none', borderRadius: 'inherit',
          transition: glareStyle.opacity === 0 ? 'opacity 0.55s' : undefined,
        }}
      />
      {children}
    </motion.div>
  );
};

// NumberTicker: counts from 0 → target with a spring-eased animation
const NumberTicker = ({ value, suffix = "", duration = 2000 }) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true;
          observer.disconnect();

          const start = performance.now();
          const end = value;

          const tick = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * end);
            setDisplay(current);
            if (progress < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref}>
      {display.toLocaleString()}{suffix}
    </span>
  );
};

const BorderBeam = ({ duration = 8, delay = 0, colorFrom = "#3b82f6", colorTo = "#8b5cf6", className = "" }) => {
  return (
    <div 
      className={`pointer-events-none absolute inset-0 z-0 rounded-[inherit] border-[1.5px] border-transparent ${className}`}
      style={{
        mask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0) border-box",
        WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0) border-box",
        WebkitMaskComposite: "destination-out",
        maskComposite: "exclude",
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: duration, ease: "linear", delay: delay }}
        style={{
          position: "absolute",
          top: "-100%",
          left: "-100%",
          width: "300%",
          height: "300%",
          background: `conic-gradient(from 0deg, transparent 75%, ${colorFrom} 90%, ${colorTo} 100%)`,
        }}
      />
    </div>
  );
};

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const features = [
    {
      title: "Workspace",
      desc: "Instantly ingest entire repositories and establish a global context for cross-file intelligent analysis.",
      icon: <Layers className="w-5 h-5 text-gray-700" />,
    },
    {
      title: "Incident",
      desc: "Debug production stack traces instantly with AI that cross-references your codebase against live errors.",
      icon: <ShieldCheck className="w-5 h-5 text-gray-700" />,
    },
    {
      title: "Assistant",
      desc: "Your cognitive pair programmer. Ask questions, build features, and navigate your architecture.",
      icon: <Terminal className="w-5 h-5 text-gray-700" />,
    },
    {
      title: "Mind Map",
      desc: "Visually trace logic flows, dependencies, and complex inheritance chains in real-time graphs.",
      icon: <Globe className="w-5 h-5 text-gray-700" />,
    },
    {
      title: "Code Quality",
      desc: "Identify anti-patterns, calculate complexity scores, and get actionable steps for refactoring.",
      icon: <CheckCircle2 className="w-5 h-5 text-gray-700" />,
    },
    {
      title: "Auto Comment",
      desc: "Generate comprehensive, context-aware docstrings and inline comments instantly.",
      icon: <MessageSquare className="w-5 h-5 text-gray-700" />,
    },
    {
      title: "Generate Tests",
      desc: "Automatically write unit and integration tests with maximum coverage for complex logic paths.",
      icon: <Check className="w-5 h-5 text-gray-700" />,
    },
    {
      title: "Docs",
      desc: "Keep your knowledge base perfectly synced with your code through automated documentation generation.",
      icon: <Code className="w-5 h-5 text-gray-700" />,
    },
    {
      title: "Debug",
      desc: "Step through execution paths mentally with AI that isolates the exact line causing unexpected behavior.",
      icon: <Bug className="w-5 h-5 text-gray-700" />,
    },
    {
      title: "Diff",
      desc: "Analyze pull requests securely. Catch breaking changes and logic regressions before merging.",
      icon: <TrendingUp className="w-5 h-5 text-gray-700" />,
    }
  ];

  const faqs = [
    {
      q: "How does the AI understand my logic?",
      a: "Our proprietary LLM is trained on billions of lines of high-quality code and specifically fine-tuned for semantic logic analysis rather than just pattern matching."
    },
    {
      q: "Does it work with private repositories?",
      a: "Yes, our Professional and Enterprise plans offer secure integration with private GitHub, GitLab, and Bitbucket repositories with SOC2 compliance."
    },
    {
      q: "Can I integrate it with VS Code?",
      a: "Absolutely. We offer a first-class VS Code extension that brings Companion AI directly into your editor."
    },
    {
      q: "How secure is my code?",
      a: "We prioritize security. Code is processed in ephemeral environments and never used for training without explicit Enterprise-grade consent."
    }
  ];

  const languages = ['JavaScript', 'Python', 'TypeScript', 'Rust', 'Go', 'C++', 'Java', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Dart', 'C#', 'SQL'];
  const marqueeLangs = [...languages, ...languages];

  return (
    <div className="bg-[#dde1e7] text-gray-900 font-sans overflow-x-hidden selection:bg-gray-200 cursor-none">
      <NeumorphicCursor />
      
      {/* Hero Section */}
      <section 
        className="relative min-h-[100svh] overflow-hidden bg-cover bg-center flex flex-col"
        style={{ backgroundImage: 'url(https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260611_133301_d5f2a94a-b22e-4e4a-a6b6-eacdddf1f5b0.png&w=1280&q=85)' }}
      >
        <Navbar user={user} logout={logout} setIsAuthModalOpen={setIsAuthModalOpen} navigate={navigate} />
        
        {/* Spacer */}
        <div className="flex-1 min-h-8 sm:min-h-12 lg:min-h-16 shrink-0" />

        {/* Hero Content — Neumorphic elements over the background image */}
        <div className="text-center flex flex-col items-center px-4 relative z-20">

          {/* Neumorphic glass badge */}
        
          <h1 className="text-gray-800 font-black leading-[1.05] tracking-tight text-[40px] min-[400px]:text-[44px] sm:text-6xl lg:text-7xl xl:text-[80px] drop-shadow-sm">
            <span className="block animate-fade-up">Master code.</span>
            <span className="block animate-fade-up [animation-delay:100ms]">Effortlessly.</span>
          </h1>

          {/* Neumorphic search bar — concave inset */}
          <form
            className="animate-fade-up [animation-delay:220ms] mt-10 sm:mt-12 w-full max-w-xl flex items-center gap-3 rounded-full pl-6 pr-2 py-2"
            style={{
              background: '#dde1e7',
              boxShadow: 'inset 6px 6px 14px #b8bec9, inset -6px -6px 14px #ffffff',
            }}
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="text"
              placeholder="Explain the authentication flow in this repo..."
              className="flex-1 bg-transparent text-base text-gray-700 placeholder-gray-400 outline-none py-1.5 m-0 leading-normal"
            />
            {/* Convex submit button */}
            <button
              type="submit"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full shrink-0 flex items-center justify-center transition-all active:scale-95"
              style={{
                background: '#dde1e7',
                boxShadow: '4px 4px 10px #b8bec9, -4px -4px 10px #ffffff',
                color: '#374151',
              }}
              onMouseDown={e => {
                e.currentTarget.style.boxShadow = 'inset 4px 4px 10px rgba(184,190,201,0.7), inset -4px -4px 10px rgba(255,255,255,0.8)';
              }}
              onMouseUp={e => {
                e.currentTarget.style.boxShadow = '4px 4px 10px rgba(184,190,201,0.7), -4px -4px 10px rgba(255,255,255,0.8)';
              }}
            >
              <ArrowUp className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>
          </form>

          <p
            className="animate-fade-up [animation-delay:340ms] mt-6 px-6 py-4 rounded-2xl text-gray-600 text-sm sm:text-base leading-relaxed max-w-md"
            style={{
              background: '#dde1e7',
              boxShadow: '4px 4px 12px #b8bec9, -4px -4px 12px #ffffff',
            }}
          >
            Debug stack traces, visualize architecture, and ship features instantly.
          </p>

          <div className="animate-fade-up [animation-delay:460ms] mt-8 flex flex-wrap items-center justify-center gap-6">
            {/* Primary — convex extruded neumorphic button */}
            <button
              onClick={() => user ? navigate('/Codeview') : setIsAuthModalOpen(true)}
              className="text-gray-700 text-sm sm:text-base font-bold px-8 py-3.5 rounded-full transition-all active:scale-95"
              style={{
                background: '#dde1e7',
                boxShadow: '6px 6px 16px #b8bec9, -6px -6px 16px #ffffff',
              }}
              onMouseDown={e => {
                e.currentTarget.style.boxShadow = 'inset 5px 5px 12px #b8bec9, inset -5px -5px 12px #ffffff';
              }}
              onMouseUp={e => {
                e.currentTarget.style.boxShadow = '6px 6px 16px #b8bec9, -6px -6px 16px #ffffff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '6px 6px 16px #b8bec9, -6px -6px 16px #ffffff';
              }}
            >
              {user ? 'Launch App' : 'Try It Free'}
            </button>

            {/* Secondary — concave inset neumorphic button */}
            <a
              href="#features"
              className="text-gray-600 text-sm sm:text-base font-bold px-8 py-3.5 rounded-full transition-all flex items-center justify-center active:scale-95"
              style={{
                background: '#dde1e7',
                boxShadow: 'inset 4px 4px 10px #b8bec9, inset -4px -4px 10px #ffffff',
              }}
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1 min-h-10 sm:min-h-12 lg:min-h-16 shrink-0" />

        {/* Dashboard container */}
        <motion.div 
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
          className="relative z-0 w-[92%] sm:w-[84%] lg:w-[72%] max-w-4xl mx-auto shrink-0 -mb-10 sm:-mb-20 lg:-mb-32"
        >
          <ScaledDashboard>
            <DashboardMockup />
          </ScaledDashboard>
        </motion.div>

        {/* Grass Overlay */}
        <img 
          src="https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1781191264/grass_eam204.png"
          className="pointer-events-none absolute bottom-0 left-0 z-10 w-full select-none"
          alt="Grass foreground"
        />
      </section>

      {/* Language Support Marquee */}
      <section className="py-12 border-b border-gray-100 bg-gray-50 overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-gray-50 to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-50 to-transparent z-10" />
        
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
          className="flex gap-4 w-fit"
        >
          {marqueeLangs.map((lang, i) => (
            <div key={i} className="flex items-center justify-center px-6 py-2.5 rounded-full bg-white border border-gray-200 text-gray-600 text-sm font-medium shadow-sm whitespace-nowrap">
              {lang}
            </div>
          ))}
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-24 border-b border-gray-100 bg-white overflow-hidden">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 text-center"
        >
          {[
            { value: 3500000, suffix: "+", display: null, label: "Lines Reviewed" },
            { value: 85, suffix: "%", display: null, label: "Bugs Prevented" },
            { value: 12, suffix: "ms", display: null, label: "Avg. Response" },
            { value: null, suffix: "", display: "SOC2", label: "Security Certified" }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              variants={{
                hidden: { opacity: 0, y: 30, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
              }}
            >
              <div className="text-3xl sm:text-4xl font-black text-gray-900 mb-1 sm:mb-2 tracking-tight">
                {stat.value !== null
                  ? <NumberTicker value={stat.value} suffix={stat.suffix} duration={1800} />
                  : stat.display
                }
              </div>
              <div className="text-gray-500 text-xs sm:text-sm font-semibold tracking-wide uppercase">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>      {/* Features Grid — Neumorphic */}
      <section
        id="features"
        className="py-20 sm:py-32 px-4 sm:px-6 overflow-hidden"
        style={{ background: '#dde1e7' }}
      >
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-12 sm:mb-20"
          >
            {/* Neumorphic pill badge */}
            <div
              className="mb-5 inline-flex px-5 py-2 rounded-full text-gray-500 text-[10px] sm:text-xs font-bold tracking-widest uppercase"
              style={{ background: '#dde1e7', boxShadow: '4px 4px 10px #b8bec9, -4px -4px 10px #ffffff' }}
            >
              Trusted by 50,000+ engineers worldwide
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-700 mb-4 sm:mb-6 tracking-tight">
              Built for Excellence.
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-base sm:text-lg font-medium">
              Powerful features designed to handle the most complex codebases with surgical precision.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 sm:gap-8"
          >
            {features.map((f, i) => {
              const accents = [
                ['#6366f1','#8b5cf6'],
                ['#3b82f6','#06b6d4'],
                ['#ec4899','#f43f5e'],
                ['#f59e0b','#f97316'],
                ['#10b981','#06b6d4'],
                ['#8b5cf6','#ec4899'],
                ['#6366f1','#3b82f6'],
                ['#f43f5e','#f97316'],
                ['#10b981','#84cc16'],
                ['#06b6d4','#6366f1'],
              ];
              const [c1, c2] = accents[i % accents.length];

              return (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 40 },
                    visible: {
                      opacity: 1, y: 0,
                      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 },
                    },
                  }}
                  className="group relative rounded-[28px] p-6 cursor-pointer select-none"
                  style={{
                    background: '#dde1e7',
                    boxShadow: '9px 9px 22px #b8bec9, -9px -9px 22px #ffffff',
                    transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                  }}
                  whileHover={{
                    y: -6,
                    transition: { type: 'spring', stiffness: 260, damping: 20 },
                  }}
                  onMouseDown={e => {
                    e.currentTarget.style.boxShadow = 'inset 7px 7px 16px #b8bec9, inset -7px -7px 16px #ffffff';
                  }}
                  onMouseUp={e => {
                    e.currentTarget.style.boxShadow = '9px 9px 22px #b8bec9, -9px -9px 22px #ffffff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '9px 9px 22px #b8bec9, -9px -9px 22px #ffffff';
                  }}
                >
                  {/* Coloured accent strip — extruded on top edge */}
                  <div
                    className="absolute top-0 left-8 right-8 h-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg, ${c1}, ${c2})`, boxShadow: `0 0 10px ${c1}88` }}
                  />

                  {/* Concave icon well — sunk into the surface */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                    style={{
                      background: '#dde1e7',
                      boxShadow: 'inset 5px 5px 12px #b8bec9, inset -5px -5px 12px #ffffff',
                    }}
                  >
                    {/* Icon tinted on hover */}
                    <div
                      className="transition-all duration-300 group-hover:scale-115"
                      style={{ filter: 'grayscale(0.4)', transition: 'filter 0.3s' }}
                      onMouseEnter={e => (e.currentTarget.style.filter = 'none')}
                      onMouseLeave={e => (e.currentTarget.style.filter = 'grayscale(0.4)')}
                    >
                      {f.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-[15px] font-bold text-gray-600 mb-2 tracking-tight group-hover:text-gray-800 transition-colors duration-300">
                    {f.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-500 text-[13px] leading-relaxed font-medium">
                    {f.desc}
                  </p>

                  {/* Convex pill — protrudes out */}
                  <div
                    className="mt-5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide"
                    style={{
                      background: '#dde1e7',
                      boxShadow: '3px 3px 8px #b8bec9, -3px -3px 8px #ffffff',
                      color: '#8b95a5',
                    }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full transition-colors duration-400 group-hover:shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                    />
                    Active
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    
      {/* FAQ Section — Neumorphic */}
      <section
        id="faq"
        className="py-20 sm:py-32 px-4 sm:px-6 overflow-hidden"
        style={{ background: '#dde1e7' }}
      >
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-12 sm:mb-16"
          >
            <div
              className="mb-5 inline-flex px-5 py-2 rounded-full text-gray-500 text-[10px] sm:text-xs font-bold tracking-widest uppercase"
              style={{ background: '#dde1e7', boxShadow: '4px 4px 10px #b8bec9, -4px -4px 10px #ffffff' }}
            >
              Got Questions?
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-700 mb-4 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 font-medium">Everything you need to know about our AI.</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
            className="space-y-4"
          >
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
                }}
                className="rounded-[22px] overflow-hidden cursor-pointer select-none"
                style={{
                  background: '#dde1e7',
                  boxShadow: activeFaq === i
                    ? 'inset 6px 6px 14px #b8bec9, inset -6px -6px 14px #ffffff'
                    : '7px 7px 18px #b8bec9, -7px -7px 18px #ffffff',
                  transition: 'box-shadow 0.35s ease',
                }}
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              >
                <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
                  <span className="font-bold text-gray-700 text-[15px]">{faq.q}</span>
                  {/* Neumorphic chevron button */}
                  <div
                    className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center transition-all duration-300"
                    style={{
                      background: '#dde1e7',
                      boxShadow: activeFaq === i
                        ? 'inset 3px 3px 8px #b8bec9, inset -3px -3px 8px #ffffff'
                        : '3px 3px 8px #b8bec9, -3px -3px 8px #ffffff',
                    }}
                  >
                    <motion.div
                      animate={{ rotate: activeFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <ChevronDown size={16} className="text-gray-500" />
                    </motion.div>
                  </div>
                </div>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      {/* Concave answer panel — sunk into the surface */}
                      <div
                        className="mx-4 mb-4 p-4 rounded-xl text-gray-500 text-sm leading-relaxed"
                        style={{
                          background: '#dde1e7',
                          boxShadow: 'inset 4px 4px 10px #b8bec9, inset -4px -4px 10px #ffffff',
                        }}
                      >
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer — Neumorphic */}
      <footer
        className="pt-16 sm:pt-24 pb-10 px-4 sm:px-8"
        style={{ background: '#dde1e7' }}
      >
        <div className="max-w-7xl mx-auto">

          {/* Top grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 sm:gap-12 mb-14">

            {/* Brand column */}
            <div className="col-span-1 md:col-span-1">
              {/* Extruded logo chip */}
              <div
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl mb-6 cursor-pointer"
                style={{
                  background: '#dde1e7',
                  boxShadow: '6px 6px 16px #b8bec9, -6px -6px 16px #ffffff',
                }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <Logo className="h-5 w-5 text-gray-700 shrink-0" />
                <span className="text-[15px] font-bold text-gray-700 tracking-tight">
                  AI Code <span className="text-gray-500 font-medium">Companion</span>
                </span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Empowering the next generation of software engineers with cognitive AI tools that understand code at a human level.
              </p>
            </div>

            {/* Link columns */}
            {[
              {
                title: 'Product',
                links: [
                  { label: 'Code Analysis', href: '/Codeview' },
                  { label: 'Documentation', href: '/docs' },
                  { label: 'Security Audit', href: '#' },
                  { label: 'VS Code Extension', href: '#' },
                ],
              },
              {
                title: 'Company',
                links: [
                  { label: 'About Us', href: '/about' },
                  { label: 'Careers', href: '#' },
                  { label: 'Blog', href: '#' },
                  { label: 'Press Kit', href: '#' },
                ],
              },
              {
                title: 'Legal',
                links: [
                  { label: 'Privacy Policy', href: '#' },
                  { label: 'Terms of Service', href: '#' },
                  { label: 'Cookie Policy', href: '#' },
                  { label: 'Compliance', href: '#' },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                {/* Concave section header */}
                <div
                  className="inline-block px-3 py-1 rounded-lg mb-6 text-[11px] font-black tracking-widest uppercase text-gray-600"
                  style={{
                    background: '#dde1e7',
                    boxShadow: 'inset 3px 3px 7px #b8bec9, inset -3px -3px 7px #ffffff',
                  }}
                >
                  {col.title}
                </div>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-sm text-gray-500 font-medium hover:text-gray-800 transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Neumorphic divider — inset groove */}
          <div
            className="w-full h-[2px] rounded-full mb-8"
            style={{
              background: '#dde1e7',
              boxShadow: 'inset 2px 0 4px #b8bec9, inset -2px 0 4px #ffffff',
            }}
          />

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <p className="text-[11px] text-gray-400 font-bold tracking-widest uppercase">
              © 2026 AI Code Companion. All Rights Reserved.
            </p>

            {/* Social pills — convex extruded */}
            <div className="flex items-center gap-3">
              {['Twitter', 'LinkedIn', 'GitHub'].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="px-4 py-2 rounded-full text-[11px] font-bold tracking-wide text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  style={{
                    background: '#dde1e7',
                    boxShadow: '4px 4px 10px #b8bec9, -4px -4px 10px #ffffff',
                  }}
                  onMouseDown={e => {
                    e.currentTarget.style.boxShadow = 'inset 3px 3px 8px #b8bec9, inset -3px -3px 8px #ffffff';
                  }}
                  onMouseUp={e => {
                    e.currentTarget.style.boxShadow = '4px 4px 10px #b8bec9, -4px -4px 10px #ffffff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '4px 4px 10px #b8bec9, -4px -4px 10px #ffffff';
                  }}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

        </div>
      </footer>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
};

export default Home;