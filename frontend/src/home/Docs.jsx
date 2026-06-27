import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Rocket, 
  Settings, 
  HelpCircle, 
  Search, 
  Menu, 
  X,
  Code,
  CheckCircle,
  Copy,
  TerminalSquare,
  ShieldAlert,
  GitPullRequest,
  Check,
  ChevronRight,
  ShieldCheck,
  Cpu,
  ArrowLeft,
  Brain
} from 'lucide-react';
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
      follower.current.x += (pos.current.x - follower.current.x) * 0.12;
      follower.current.y += (pos.current.y - follower.current.y) * 0.12;

      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate(${follower.current.x}px, ${follower.current.y}px) translate(-50%,-50%)`;
      }
      if (dotRef.current) {
        const scale = isHover.current ? ' scale(0.7)' : ' scale(1)';
        dotRef.current.style.transform =
          `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%,-50%)${scale}`;
      }
      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);

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

const Navbar = ({ user, logout, setIsAuthModalOpen, navigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="animate-fade-down relative z-[100] px-5 sm:px-8 lg:px-10 py-4 sm:py-5 flex items-center justify-between">
      <div className="flex items-center gap-6">
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
        <Link 
          to="/"
          className="flex items-center gap-2 cursor-pointer text-gray-900 relative z-[1000]" 
        >
          <Logo className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="font-bold text-lg hidden sm:block tracking-tight text-gray-900">
            AI Code <span className="text-gray-500">Companion</span>
          </span>
        </Link>
        <div className="h-4 w-px bg-gray-300 mx-2 hidden sm:block"></div>
        <span className="px-2.5 py-0.5 rounded-full text-gray-600 text-[10px] font-black tracking-widest uppercase hidden sm:block"
          style={{
            background: '#dde1e7',
            boxShadow: 'inset 2px 2px 5px #b8bec9, inset -2px -2px 5px #ffffff'
          }}
        >
          Documentation
        </span>
      </div>
      
      {/* Search & CTA */}
      <div className="flex items-center gap-4 relative z-[1000]">
        <div className="hidden lg:flex relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
          <input 
            type="text" 
            placeholder="Quick search..." 
            className="pl-10 pr-4 py-2 rounded-full text-xs font-bold outline-none transition-all w-64 text-gray-700 placeholder:text-gray-500"
            style={{
              background: '#dde1e7',
              boxShadow: 'inset 4px 4px 8px #b8bec9, inset -4px -4px 8px #ffffff'
            }}
          />
        </div>
        
        <Link to="/" className="text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-all px-4 py-2 rounded-full"
          style={{
            background: '#dde1e7',
            boxShadow: '4px 4px 10px #b8bec9, -4px -4px 10px #ffffff'
          }}
          onMouseDown={e => e.currentTarget.style.boxShadow = 'inset 3px 3px 8px #b8bec9, inset -3px -3px 8px #ffffff'}
          onMouseUp={e => e.currentTarget.style.boxShadow = '4px 4px 10px #b8bec9, -4px -4px 10px #ffffff'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '4px 4px 10px #b8bec9, -4px -4px 10px #ffffff'}
        >
          <ArrowLeft size={14} /> Back
        </Link>
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
            <Link to="/docs" className="text-[16px] font-bold text-gray-700 hover:text-gray-900" onClick={() => setIsOpen(false)}>Docs</Link>
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

const sectionIds = [
  "introduction",
  "getting-started",
  "features",
  "how-to-use",
  "advanced-features",
  "faq"
];

const Docs = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('introduction');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      let currentSection = sectionIds[0];
      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            currentSection = id;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setActiveSection(id);
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleCopyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const codeExample = `// Example: Neural Workspace Integration
const companion = require('companion-ai');

const report = await companion.analyze({
  repository: 'https://github.com/org/repo',
  intelligence: 'deep-neural',
  output: 'markdown'
});

console.log(report.summary);`;

  const NavContent = () => (
    <ul className="space-y-3 mt-8">
      {[
        { id: 'introduction', icon: BookOpen, label: 'Introduction' },
        { id: 'getting-started', icon: Rocket, label: 'Getting Started' },
        { id: 'features', icon: Settings, label: 'Platform Features' },
        { id: 'how-to-use', icon: TerminalSquare, label: 'Engineering Guide' },
        { id: 'advanced-features', icon: Cpu, label: 'Neural Intelligence' },
        { id: 'faq', icon: HelpCircle, label: 'Technical FAQ' }
      ].map((item) => {
        const isActive = activeSection === item.id;
        return (
          <li key={item.id}>
            <button
              onClick={() => scrollToSection(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-bold transition-all duration-200 ${
                isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
              style={{
                background: '#dde1e7',
                boxShadow: isActive 
                  ? 'inset 4px 4px 8px #b8bec9, inset -4px -4px 8px #ffffff'
                  : '4px 4px 10px #b8bec9, -4px -4px 10px #ffffff'
              }}
            >
              <div className="flex items-center gap-3">
                <item.icon size={16} className={isActive ? 'text-gray-800' : 'text-gray-500'} />
                {item.label}
              </div>
              {isActive && <ChevronRight size={14} className="text-gray-700" />}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="bg-[#dde1e7] text-gray-900 font-sans min-h-screen overflow-x-hidden selection:bg-gray-300 cursor-none">
      <NeumorphicCursor />
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#dde1e7]/80 backdrop-blur-xl border-b border-gray-300/30">
        <Navbar user={user} logout={logout} setIsAuthModalOpen={setIsAuthModalOpen} navigate={navigate} />
      </header>

      <div className="max-w-[1600px] mx-auto flex">
        {/* Left Sidebar (Desktop) */}
        <aside className="hidden md:block w-72 shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto no-scrollbar py-8 pl-8 pr-6 border-r border-gray-300/30">
          <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Documentation</div>
          <NavContent />
          
          <div className="mt-20 p-6 rounded-[2rem] relative overflow-hidden"
            style={{
              background: '#dde1e7',
              boxShadow: '6px 6px 14px #b8bec9, -6px -6px 14px #ffffff'
            }}
          >
             <div className="relative z-10">
                <h4 className="text-gray-800 font-bold text-sm mb-2">Need Enterprise Support?</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed mb-4 font-medium">Our dedicated team is ready to help you scale your engineering intelligence.</p>
                <button 
                  className="w-full py-2.5 text-gray-700 text-[11px] font-bold rounded-xl transition-all"
                  style={{
                    background: '#dde1e7',
                    boxShadow: '4px 4px 10px #b8bec9, -4px -4px 10px #ffffff'
                  }}
                  onMouseDown={e => e.currentTarget.style.boxShadow = 'inset 3px 3px 8px #b8bec9, inset -3px -3px 8px #ffffff'}
                  onMouseUp={e => e.currentTarget.style.boxShadow = '4px 4px 10px #b8bec9, -4px -4px 10px #ffffff'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '4px 4px 10px #b8bec9, -4px -4px 10px #ffffff'}
                >
                  Contact Sales
                </button>
             </div>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 min-w-0 max-w-5xl px-6 py-16 md:px-12 lg:px-24">
          
          <div className="max-w-3xl">
            
            {/* Introduction */}
            <section id="introduction" className="mb-24 scroll-mt-24">
              <h1 className="text-4xl md:text-5xl font-black text-gray-800 tracking-tight mb-8">
                The Engineering Intelligence <span className="text-gray-500">Manual</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed font-medium">
                Welcome to the official Companion AI documentation. Learn how to leverage our high-fidelity neural networks to deconstruct complex architectures and accelerate your development cycle.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12">
                <div className="p-8 rounded-[30px]"
                  style={{
                    background: '#dde1e7',
                    boxShadow: '6px 6px 14px #b8bec9, -6px -6px 14px #ffffff'
                  }}
                >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-700 mb-5"
                      style={{
                        background: '#dde1e7',
                        boxShadow: 'inset 4px 4px 8px #b8bec9, inset -4px -4px 8px #ffffff'
                      }}
                    >
                        <ShieldCheck size={20} />
                    </div>
                    <h4 className="text-gray-800 font-bold mb-2">Secure by Design</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">End-to-end encrypted neural processing. Your intellectual property never leaves our secure perimeter.</p>
                </div>
                <div className="p-8 rounded-[30px]"
                  style={{
                    background: '#dde1e7',
                    boxShadow: '6px 6px 14px #b8bec9, -6px -6px 14px #ffffff'
                  }}
                >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-700 mb-5"
                      style={{
                        background: '#dde1e7',
                        boxShadow: 'inset 4px 4px 8px #b8bec9, inset -4px -4px 8px #ffffff'
                      }}
                    >
                        <Cpu size={20} />
                    </div>
                    <h4 className="text-gray-800 font-bold mb-2">Neural Optimization</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">Proprietary RAG infrastructure designed specifically for high-density codebase deconstruction.</p>
                </div>
              </div>
            </section>

            {/* Getting Started */}
            <section id="getting-started" className="mb-24 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-black text-gray-800 mb-8 flex items-center gap-3">
                <div className="w-1.5 h-8 rounded-full" style={{ background: 'linear-gradient(135deg, #a0b0c5, #8598b0)' }} />
                Getting Started
              </h2>
              <p className="text-gray-500 mb-10 text-lg font-medium">Initialize your first workspace and experience the power of Companion in minutes.</p>
              
              <div className="space-y-6">
                {[
                  { step: "01", title: "Authentication", desc: "Secure your session by authenticating with your enterprise credentials." },
                  { step: "02", title: "Repository Sync", desc: "Paste your GitHub URL into the Console to establish a neural link." },
                  { step: "03", title: "Vector Indexing", desc: "Click 'Build Knowledge Base' to create a high-dimensional vector map of your repo." },
                  { step: "04", title: "Neural Analysis", desc: "Select files and launch the intelligence modules for deep insight generation." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 p-6 rounded-[2rem]"
                    style={{
                      background: '#dde1e7',
                      boxShadow: '6px 6px 14px #b8bec9, -6px -6px 14px #ffffff'
                    }}
                  >
                    <div className="text-3xl font-black shrink-0"
                      style={{
                        color: 'transparent',
                        textShadow: '2px 2px 4px rgba(255,255,255,1), -2px -2px 4px rgba(184,190,201,1)'
                      }}
                    >
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Features */}
            <section id="features" className="mb-24 scroll-mt-24">
               <h2 className="text-2xl md:text-3xl font-black text-gray-800 mb-8 flex items-center gap-3">
                <div className="w-1.5 h-8 rounded-full" style={{ background: 'linear-gradient(135deg, #a0b0c5, #8598b0)' }} />
                Platform Features
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="rounded-[2rem] p-8"
                  style={{
                    background: '#dde1e7',
                    boxShadow: '6px 6px 14px #b8bec9, -6px -6px 14px #ffffff'
                  }}
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-700 mb-6"
                    style={{
                      background: '#dde1e7',
                      boxShadow: 'inset 4px 4px 8px #b8bec9, inset -4px -4px 8px #ffffff'
                    }}
                  >
                    <Code size={20} />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-3 text-lg">Cross-File Explanation</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">Deconstruct dependencies across multiple files simultaneously with global context awareness.</p>
                </div>
                
                <div className="rounded-[2rem] p-8"
                  style={{
                    background: '#dde1e7',
                    boxShadow: '6px 6px 14px #b8bec9, -6px -6px 14px #ffffff'
                  }}
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-700 mb-6"
                    style={{
                      background: '#dde1e7',
                      boxShadow: 'inset 4px 4px 8px #b8bec9, inset -4px -4px 8px #ffffff'
                    }}
                  >
                    <ShieldAlert size={20} />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-3 text-lg">Structural Audits</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">Identify architectural fragility, potential race conditions, and memory leaks automatically.</p>
                </div>
                
                <div className="rounded-[2rem] p-8"
                  style={{
                    background: '#dde1e7',
                    boxShadow: '6px 6px 14px #b8bec9, -6px -6px 14px #ffffff'
                  }}
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-700 mb-6"
                    style={{
                      background: '#dde1e7',
                      boxShadow: 'inset 4px 4px 8px #b8bec9, inset -4px -4px 8px #ffffff'
                    }}
                  >
                    <CheckCircle size={20} />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-3 text-lg">Neural Mind-Maps</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">Visualize the underlying logic of your codebase through AI-generated structural diagrams.</p>
                </div>
                
                <div className="rounded-[2rem] p-8"
                  style={{
                    background: '#dde1e7',
                    boxShadow: '6px 6px 14px #b8bec9, -6px -6px 14px #ffffff'
                  }}
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-700 mb-6"
                    style={{
                      background: '#dde1e7',
                      boxShadow: 'inset 4px 4px 8px #b8bec9, inset -4px -4px 8px #ffffff'
                    }}
                  >
                    <Brain size={20} />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-3 text-lg">Workspace Q&A</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">Query your entire indexed repository using natural language in our dedicated Neural Chat.</p>
                </div>
              </div>
            </section>

            {/* Engineering Guide */}
            <section id="how-to-use" className="mb-24 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-black text-gray-800 mb-8 flex items-center gap-3">
                <div className="w-1.5 h-8 rounded-full" style={{ background: 'linear-gradient(135deg, #a0b0c5, #8598b0)' }} />
                Engineering Guide
              </h2>
              <div className="rounded-[2.5rem] p-10 relative overflow-hidden"
                style={{
                  background: '#dde1e7',
                  boxShadow: 'inset 8px 8px 16px #b8bec9, inset -8px -8px 16px #ffffff'
                }}
              >
                <div className="space-y-6 relative z-10">
                  <p className="font-bold text-gray-800 text-lg">Standard Operating Procedure:</p>
                  <ol className="space-y-5">
                    {[
                        "Establish high-bandwidth repository connection",
                        "Initiate vector indexing for global context",
                        "Multi-select dependency-heavy modules",
                        "Execute high-density neural analysis",
                        "Export refined documentation or refactor logs"
                    ].map((text, i) => (
                        <li key={i} className="flex items-center gap-4 text-sm text-gray-600 font-bold">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-gray-700 shrink-0"
                              style={{
                                background: '#dde1e7',
                                boxShadow: '4px 4px 8px #b8bec9, -4px -4px 8px #ffffff'
                              }}
                            >{i+1}</div>
                            {text}
                        </li>
                    ))}
                  </ol>
                </div>
              </div>
            </section>

            {/* Neural Intelligence / Code Block */}
            <section id="advanced-features" className="mb-24 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-black text-gray-800 mb-8 flex items-center gap-3">
                <div className="w-1.5 h-8 rounded-full" style={{ background: 'linear-gradient(135deg, #a0b0c5, #8598b0)' }} />
                Neural Intelligence
              </h2>
              
              <p className="text-gray-500 mb-10 text-lg font-medium leading-relaxed">Integrate Companion high-fidelity analysis into your existing CI/CD automation suite.</p>
              
              <div className="rounded-[2rem] overflow-hidden"
                style={{
                  background: '#dde1e7',
                  boxShadow: '8px 8px 16px #b8bec9, -8px -8px 16px #ffffff'
                }}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300/40">
                  <div className="flex items-center gap-2">
                      <div className="flex gap-2 mr-4">
                          <div className="w-3 h-3 rounded-full" style={{ background: '#dde1e7', boxShadow: 'inset 2px 2px 4px #b8bec9, inset -2px -2px 4px #ffffff' }} />
                          <div className="w-3 h-3 rounded-full" style={{ background: '#dde1e7', boxShadow: 'inset 2px 2px 4px #b8bec9, inset -2px -2px 4px #ffffff' }} />
                          <div className="w-3 h-3 rounded-full" style={{ background: '#dde1e7', boxShadow: 'inset 2px 2px 4px #b8bec9, inset -2px -2px 4px #ffffff' }} />
                      </div>
                      <span className="text-[10px] text-gray-500 font-black tracking-widest uppercase">integration-demo.js</span>
                  </div>
                  <button 
                    onClick={() => handleCopyCode(codeExample)}
                    className="p-2 text-gray-500 hover:text-gray-800 rounded-xl transition-all"
                  >
                    {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="p-8 overflow-x-auto custom-scrollbar"
                  style={{
                    background: '#dde1e7',
                    boxShadow: 'inset 6px 6px 12px #b8bec9, inset -6px -6px 12px #ffffff'
                  }}
                >
                  <pre className="text-sm font-mono leading-relaxed text-gray-700">
                    <code>
                      <span className="text-gray-400">// Example: Neural Workspace Integration</span><br/>
                      <span className="font-bold">const</span> companion = <span className="font-bold">require</span>('companion-ai');<br/><br/>
                      <span className="font-bold">const</span> report = <span className="font-bold">await</span> companion.analyze({'{'}<br/>
                      &nbsp;&nbsp;repository: 'https://github.com/org/repo',<br/>
                      &nbsp;&nbsp;intelligence: 'deep-neural',<br/>
                      &nbsp;&nbsp;output: 'markdown'<br/>
                      {'}'});<br/><br/>
                      console.log(report.summary);
                    </code>
                  </pre>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="mb-24 scroll-mt-24">
               <h2 className="text-2xl md:text-3xl font-black text-gray-800 mb-8 flex items-center gap-3">
                <div className="w-1.5 h-8 rounded-full" style={{ background: 'linear-gradient(135deg, #a0b0c5, #8598b0)' }} />
                Technical FAQ
              </h2>
              
              <div className="space-y-6">
                {[
                    { q: "How does the Neural Workspace work?", a: "Companion uses a proprietary transformer architecture to generate high-dimensional vector embeddings of your codebase. This allows for semantic similarity matching and global context retrieval that standard static analysis tools cannot match." },
                    { q: "What is the security protocol for my code?", a: "We employ end-to-end encryption for all neural processing. Repository snapshots are ephemeral and stored only for the duration of the analysis session. We never utilize customer proprietary code to train our foundational models." },
                    { q: "Does it support private repositories?", a: "Yes. Companion supports OAuth and PAT-based authentication for private GitHub, GitLab, and Bitbucket instances, ensuring your internal code remains behind your organization's security layers." }
                ].map((item, i) => (
                    <details key={i} className="group rounded-3xl overflow-hidden [&_summary::-webkit-details-marker]:hidden"
                      style={{
                        background: '#dde1e7',
                        boxShadow: '6px 6px 14px #b8bec9, -6px -6px 14px #ffffff'
                      }}
                    >
                    <summary className="flex cursor-pointer items-center justify-between gap-4 p-6 text-gray-800 font-bold text-sm">
                        {item.q}
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition duration-300 group-open:rotate-180"
                          style={{
                            background: '#dde1e7',
                            boxShadow: 'inset 3px 3px 6px #b8bec9, inset -3px -3px 6px #ffffff'
                          }}
                        >
                             <ChevronRight size={14} className="rotate-90 text-gray-600" />
                        </div>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-gray-600 text-xs font-medium">
                        {item.a}
                    </div>
                    </details>
                ))}
              </div>
            </section>

          </div>
        </main>
      </div>

      {/* Footer — Neumorphic */}
      <footer
        className="pt-16 sm:pt-24 pb-10 px-4 sm:px-8 border-t border-gray-300/30"
        style={{ background: '#dde1e7' }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <p className="text-[11px] text-gray-500 font-bold tracking-widest uppercase">
              © 2026 AI Code Companion. All Rights Reserved.
            </p>

            {/* Social pills */}
            <div className="flex items-center gap-4">
              {['Twitter', 'LinkedIn', 'GitHub'].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="px-5 py-2.5 rounded-full text-[11px] font-bold tracking-wide text-gray-600 hover:text-gray-800 transition-colors duration-200"
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

       <style>
            {`
            .custom-scrollbar::-webkit-scrollbar {
                height: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #cdd1d8;
                border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #b8bec9;
            }
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .no-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            `}
        </style>
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
    </div>
  );
};

export default Docs;
