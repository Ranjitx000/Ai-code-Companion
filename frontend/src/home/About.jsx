import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Layers, ShieldCheck, Cpu, Code, Brain, ChevronRight } from 'lucide-react';
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
      <Link 
        to="/"
        className="flex items-center gap-2 cursor-pointer text-gray-900 relative z-[1000]" 
      >
        <Logo className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="font-bold text-lg hidden sm:block tracking-tight text-gray-900">
          AI Code <span className="text-gray-500">Companion</span>
        </span>
      </Link>
      
      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-8 text-[13px] text-gray-700 font-medium">
        <Link to="/about" className="text-gray-900 font-bold transition-colors">About</Link>
        <Link to="/docs" className="hover:text-gray-900 transition-colors">Docs</Link>
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
          className="text-gray-600 text-[13px] font-bold px-4 sm:px-5 py-2 rounded-full transition-all duration-300 hover:text-gray-800"
          style={{
            background: '#dde1e7',
            boxShadow: '4px 4px 10px #b8bec9, -4px -4px 10px #ffffff'
          }}
          onMouseDown={e => e.currentTarget.style.boxShadow = 'inset 3px 3px 8px #b8bec9, inset -3px -3px 8px #ffffff'}
          onMouseUp={e => e.currentTarget.style.boxShadow = '4px 4px 10px #b8bec9, -4px -4px 10px #ffffff'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '4px 4px 10px #b8bec9, -4px -4px 10px #ffffff'}
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

const About = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="bg-[#dde1e7] text-gray-900 font-sans min-h-screen overflow-x-hidden selection:bg-gray-200 cursor-none">
      <NeumorphicCursor />
      
      {/* Header */}
      <header className="relative z-50 bg-[#dde1e7]">
        <Navbar user={user} logout={logout} setIsAuthModalOpen={setIsAuthModalOpen} navigate={navigate} />
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-32 px-4 sm:px-6 max-w-5xl mx-auto">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-24"
        >
          <div
            className="mb-6 inline-flex px-5 py-2 rounded-full text-gray-500 text-[10px] sm:text-xs font-bold tracking-widest uppercase"
            style={{ background: '#dde1e7', boxShadow: '4px 4px 10px #b8bec9, -4px -4px 10px #ffffff' }}
          >
            The Project
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-700 mb-6 tracking-tight leading-tight">
            Understanding the <br/> AI Code Companion
          </h1>
          <p className="text-gray-500 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
            We built this platform to bridge the gap between human intuition and machine intelligence. By embedding cognitive AI directly into your workflow, we give you the ultimate pair programmer.
          </p>
        </motion.div>

        {/* Core Pillars (Neumorphic Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {[
                { icon: <Layers size={24} />, title: "Global Context", desc: "Unlike traditional AI that only sees one file, our engine ingests your entire repository to understand the true architecture." },
                { icon: <ShieldCheck size={24} />, title: "Secure Analysis", desc: "Your intellectual property is sacred. Code is processed ephemerally and never used to train foundational models." },
                { icon: <Brain size={24} />, title: "Cognitive Insights", desc: "Identify race conditions, memory leaks, and architectural flaws before they ever hit production." }
            ].map((pillar, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.6 }}
                    className="p-8 rounded-[30px]"
                    style={{
                        background: '#dde1e7',
                        boxShadow: '8px 8px 16px #b8bec9, -8px -8px 16px #ffffff'
                    }}
                >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-gray-600 mb-6"
                         style={{
                             background: '#dde1e7',
                             boxShadow: 'inset 4px 4px 8px #b8bec9, inset -4px -4px 8px #ffffff'
                         }}>
                        {pillar.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-3">{pillar.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium">{pillar.desc}</p>
                </motion.div>
            ))}
        </div>

        {/* How It Works Section */}
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-24"
        >
            <h2 className="text-3xl font-black text-center text-gray-700 mb-12">How It Works</h2>
            <div className="p-8 sm:p-12 rounded-[40px] relative overflow-hidden"
                 style={{
                     background: '#dde1e7',
                     boxShadow: 'inset 8px 8px 20px #b8bec9, inset -8px -8px 20px #ffffff'
                 }}>
                
                <div className="space-y-12 relative z-10">
                    {[
                        { step: "01", title: "Connect Your Repository", desc: "Link your GitHub, GitLab, or Bitbucket account. We pull your code securely over encrypted channels." },
                        { step: "02", title: "Neural Indexing", desc: "Our engine builds a high-dimensional vector map of your entire codebase, understanding relationships between files, classes, and methods." },
                        { step: "03", title: "Interactive Codeview", desc: "Open the Codeview dashboard. Highlight confusing legacy code, or paste a production stack trace to get instant, context-aware explanations and fixes." },
                        { step: "04", title: "Apply & Ship", desc: "Review the AI-generated diffs, apply them directly to your branch, and ship faster with confidence." }
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col sm:flex-row gap-6 items-start">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-gray-600 font-black text-lg shrink-0"
                                 style={{
                                     background: '#dde1e7',
                                     boxShadow: '4px 4px 10px #b8bec9, -4px -4px 10px #ffffff'
                                 }}>
                                {item.step}
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-gray-700 mb-2">{item.title}</h4>
                                <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>

        {/* CTA */}
        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-8">Ready to supercharge your workflow?</h2>
            <button 
                onClick={() => user ? navigate('/Codeview') : setIsAuthModalOpen(true)}
                className="px-8 py-4 rounded-full text-gray-600 font-black tracking-wide transition-all duration-200"
                style={{
                    background: '#dde1e7',
                    boxShadow: '6px 6px 14px #b8bec9, -6px -6px 14px #ffffff'
                }}
                onMouseDown={e => e.currentTarget.style.boxShadow = 'inset 4px 4px 10px #b8bec9, inset -4px -4px 10px #ffffff'}
                onMouseUp={e => e.currentTarget.style.boxShadow = '6px 6px 14px #b8bec9, -6px -6px 14px #ffffff'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '6px 6px 14px #b8bec9, -6px -6px 14px #ffffff'}
            >
                Get Started For Free
            </button>
        </div>
      </main>

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

          {/* Neumorphic divider */}
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

            {/* Social pills */}
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

export default About;
