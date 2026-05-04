import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import {
  Sparkles,
  Bug,
  Zap,
  Shield,
  Code,
  ArrowRight,
  LogOut,
  User,
  CheckCircle2,
  Terminal,
  Layers,
  Cpu,
  Github,
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Globe,
  Settings,
  ShieldCheck,
  ZapIcon,
  TrendingUp,
  Users
} from 'lucide-react';
import { useAuth } from '../hooks/AuthContext';
import AuthModal from '../shared/AuthModal';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const features = [
    {
      title: "Workspace",
      desc: "Instantly ingest entire repositories and establish a global context for cross-file intelligent analysis.",
      icon: <Layers className="w-6 h-6" />,
      color: "from-blue-500/20 to-indigo-500/20",
      accent: "text-blue-400"
    },
    {
      title: "Incident",
      desc: "Debug production stack traces instantly with AI that cross-references your codebase against live errors.",
      icon: <ShieldCheck className="w-6 h-6" />,
      color: "from-red-500/20 to-orange-500/20",
      accent: "text-red-400"
    },
    {
      title: "Assistant",
      desc: "Your cognitive pair programmer. Ask questions, build features, and navigate your architecture.",
      icon: <Terminal className="w-6 h-6" />,
      color: "from-purple-500/20 to-pink-500/20",
      accent: "text-purple-400"
    },
    {
      title: "Mind Map",
      desc: "Visually trace logic flows, dependencies, and complex inheritance chains in real-time graphs.",
      icon: <Globe className="w-6 h-6" />,
      color: "from-emerald-500/20 to-teal-500/20",
      accent: "text-emerald-400"
    },
    {
      title: "Code Quality",
      desc: "Identify anti-patterns, calculate complexity scores, and get actionable steps for refactoring.",
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: "from-yellow-500/20 to-amber-500/20",
      accent: "text-yellow-400"
    },
    {
      title: "Auto Comment",
      desc: "Generate comprehensive, context-aware docstrings and inline comments instantly.",
      icon: <MessageSquare className="w-6 h-6" />,
      color: "from-cyan-500/20 to-blue-500/20",
      accent: "text-cyan-400"
    },
    {
      title: "Generate Tests",
      desc: "Automatically write unit and integration tests with maximum coverage for complex logic paths.",
      icon: <Check className="w-6 h-6" />,
      color: "from-indigo-500/20 to-purple-500/20",
      accent: "text-indigo-400"
    },
    {
      title: "Docs",
      desc: "Keep your knowledge base perfectly synced with your code through automated documentation generation.",
      icon: <Code className="w-6 h-6" />,
      color: "from-rose-500/20 to-pink-500/20",
      accent: "text-rose-400"
    },
    {
      title: "Debug",
      desc: "Step through execution paths mentally with AI that isolates the exact line causing unexpected behavior.",
      icon: <Bug className="w-6 h-6" />,
      color: "from-orange-500/20 to-red-500/20",
      accent: "text-orange-400"
    },
    {
      title: "Diff",
      desc: "Analyze pull requests securely. Catch breaking changes and logic regressions before merging.",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "from-lime-500/20 to-green-500/20",
      accent: "text-lime-400"
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

  return (
    <div className="min-h-screen bg-[#050508] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Premium Gradient Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="absolute top-[40%] left-[60%] w-[20%] h-[20%] rounded-full bg-blue-500/5 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-xl shadow-2xl"
        >
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Code size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Companion<span className="text-indigo-400">AI</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#faq" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-4">
            {!user ? (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="text-sm font-semibold text-slate-300 hover:text-white transition-all"
              >
                Sign In
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                  <User size={14} className="text-slate-300" />
                </div>
                <button onClick={logout} className="text-slate-400 hover:text-red-400 transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            )}
            <button 
              onClick={() => user ? navigate('/Codeview') : setIsAuthModalOpen(true)}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-500/20"
            >
              Launch App
            </button>
          </div>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-bold tracking-widest uppercase flex items-center gap-2"
          >
            
            Trusted by 50,000+ engineers worldwide
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tight text-white mb-8 leading-[1.05]"
          >
            Ship <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Flawless</span> Code <br />
            with Intelligent Logic.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed"
          >
            The world's first AI-native code engineering platform that understands intent, catches logical fallacies, and optimizes for scale before you even commit.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 mb-20"
          >
            <button 
              onClick={() => user ? navigate('/Codeview') : setIsAuthModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-black font-bold text-lg hover:bg-indigo-400 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              Get Started for Free <ArrowRight size={20} />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <Github size={20} /> Star on GitHub
            </button>
          </motion.div>

          {/* Language Support Carousel */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="w-full max-w-5xl mt-8 relative overflow-hidden"
          >
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-950 to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-950 to-transparent z-10" />
            
            <motion.div 
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
              className="flex gap-4 w-fit"
            >
              {[
                'JavaScript', 'Python', 'TypeScript', 'Rust', 'Go', 'C++', 'Java', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Dart', 'C#', 'SQL',
                'JavaScript', 'Python', 'TypeScript', 'Rust', 'Go', 'C++', 'Java', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Dart', 'C#', 'SQL'
              ].map((lang, i) => (
                <div key={i} className="flex items-center justify-center px-6 py-2.5 rounded-full bg-slate-900/50 border border-slate-800 text-slate-400 text-sm font-medium whitespace-nowrap shadow-sm backdrop-blur-sm">
                  {lang}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40, rotateX: 5 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative rounded-3xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.2)]"
          >
            <div className="absolute top-0 left-0 right-0 h-10 bg-white/5 border-b border-white/5 flex items-center px-4 gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/30" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/30" />
              <div className="w-3 h-3 rounded-full bg-green-500/30" />
              <div className="ml-4 text-[10px] text-slate-500 font-mono tracking-widest uppercase">Companion Console v2.0</div>
            </div>
            <div className="p-1 pt-11">
               <img src="/premium_saas_dashboard_preview_1777190573232.png" alt="Platform Dashboard" className="w-full h-auto rounded-2xl" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <div className="text-4xl font-black text-white mb-2">3.5M+</div>
            <div className="text-slate-500 text-sm font-semibold tracking-wide uppercase">Lines Reviewed</div>
          </div>
          <div>
            <div className="text-4xl font-black text-white mb-2">85%</div>
            <div className="text-slate-500 text-sm font-semibold tracking-wide uppercase">Bugs Prevented</div>
          </div>
          <div>
            <div className="text-4xl font-black text-white mb-2">12ms</div>
            <div className="text-slate-500 text-sm font-semibold tracking-wide uppercase">Avg. Response</div>
          </div>
          <div>
            <div className="text-4xl font-black text-white mb-2">SOC2</div>
            <div className="text-slate-500 text-sm font-semibold tracking-wide uppercase">Security Certified</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Built for Excellence.</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">Powerful features designed to handle the most complex codebases with surgical precision.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className={`relative p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all duration-500 overflow-hidden group`}
              >
                <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br ${f.color} blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${f.accent}`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    
      {/* FAQ Section */}
      <section id="faq" className="py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-500 font-medium">Everything you need to know about Companion AI.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden cursor-pointer group"
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              >
                <div className="p-6 flex items-center justify-between">
                  <span className="font-bold text-white group-hover:text-indigo-400 transition-colors">{faq.q}</span>
                  {activeFaq === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 text-slate-400 text-sm leading-relaxed"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-10 leading-none">
            Scale your code <br />
            <span className="text-indigo-500 italic">without the friction.</span>
          </h2>
          <button 
            onClick={() => user ? navigate('/Codeview') : setIsAuthModalOpen(true)}
            className="px-12 py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl transition-all shadow-[0_0_60px_rgba(79,70,229,0.3)] mb-8"
          >
            Launch Your First Review
          </button>
          <p className="text-slate-500 font-medium tracking-wide">NO CREDIT CARD REQUIRED. START IN 30 SECONDS.</p>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto rounded-[3rem] p-12 md:p-20 bg-gradient-to-tr from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] -z-10" />
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">Stay ahead of the curve.</h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-10 text-lg font-medium">Join 10,000+ developers receiving our weekly engineering deep dives and AI updates.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your work email" 
              className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-indigo-500 outline-none transition-all text-white font-medium"
            />
            <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all">
              Subscribe
            </button>
          </div>
          <p className="mt-6 text-slate-500 text-xs font-semibold tracking-widest uppercase">No spam. Ever. Unsubscribe in one click.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <Code size={18} className="text-white" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">Companion<span className="text-indigo-400">AI</span></span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Empowering the next generation of software engineers with cognitive AI tools that understand code at a human level.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-slate-500 font-medium">
                <li><Link to="/Codeview" className="hover:text-indigo-400 transition-colors">Code Analysis</Link></li>
                <li><Link to="/docs" className="hover:text-indigo-400 transition-colors">Documentation</Link></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Security Audit</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">VS Code Extension</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-slate-500 font-medium">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Press Kit</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-slate-500 font-medium">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 text-slate-600 text-xs font-bold tracking-widest uppercase">
            <p>© 2026 Companion AI. ALL RIGHTS RESERVED.</p>
            <div className="flex items-center gap-6 mt-6 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
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