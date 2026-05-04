import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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

const sectionIds = [
  "introduction",
  "getting-started",
  "features",
  "how-to-use",
  "advanced-features",
  "faq"
];

const Docs = () => {
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
    <ul className="space-y-1.5 mt-8">
      {[
        { id: 'introduction', icon: BookOpen, label: 'Introduction' },
        { id: 'getting-started', icon: Rocket, label: 'Getting Started' },
        { id: 'features', icon: Settings, label: 'Platform Features' },
        { id: 'how-to-use', icon: TerminalSquare, label: 'Engineering Guide' },
        { id: 'advanced-features', icon: Cpu, label: 'Neural Intelligence' },
        { id: 'faq', icon: HelpCircle, label: 'Technical FAQ' }
      ].map((item) => (
        <li key={item.id}>
          <button
            onClick={() => scrollToSection(item.id)}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all ${activeSection === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={16} />
              {item.label}
            </div>
            {activeSection === item.id && <ChevronRight size={14} />}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="min-h-screen bg-[#050508] font-sans text-slate-300 selection:bg-indigo-500/30">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/5 h-16 flex items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-lg transition-all"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Code size={18} className="text-white" />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight hidden sm:block">
                Companion<span className="text-indigo-400">AI</span>
            </h1>
          </Link>
          <div className="h-4 w-px bg-white/10 mx-2 hidden sm:block"></div>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black tracking-widest uppercase border border-indigo-500/20">
            Documentation
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-3.5 h-3.5" />
            <input 
              type="text" 
              placeholder="Quick search..." 
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/5 rounded-full text-xs font-medium focus:bg-black focus:border-indigo-500/50 outline-none transition-all w-64"
            />
          </div>
          <Link to="/" className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2 transition-all">
            <ArrowLeft size={14} /> Back
          </Link>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto flex">
        {/* Left Sidebar (Desktop) */}
        <aside className="hidden md:block w-72 shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-hidden border-r border-white/5 py-8 pl-8 pr-6">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Documentation</div>
          <NavContent />
          
          <div className="mt-20 p-6 rounded-[2rem] bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 relative overflow-hidden">
             <div className="relative z-10">
                <h4 className="text-white font-bold text-sm mb-2">Need Enterprise Support?</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-4">Our dedicated team is ready to help you scale your engineering intelligence.</p>
                <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-xl transition-all">Contact Sales</button>
             </div>
             <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 blur-2xl -z-10" />
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <div 
              className="absolute left-0 top-0 bottom-0 w-72 bg-[#0A0A0F] border-r border-white/5 p-8 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
               <div className="flex items-center gap-2.5 mb-10">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
                        <Code size={18} className="text-white" />
                    </div>
                    <h1 className="text-lg font-bold text-white tracking-tight">
                        Companion<span className="text-indigo-400">AI</span>
                    </h1>
                </div>
              <NavContent />
            </div>
          </div>
        )}

        {/* Right Content Area */}
        <main className="flex-1 min-w-0 max-w-5xl px-6 py-16 md:px-12 lg:px-24">
          
          <div className="max-w-3xl">
            
            {/* Introduction */}
            <section id="introduction" className="mb-24 scroll-mt-24">
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-8">
                The Engineering Intelligence <span className="text-indigo-500">Manual</span>
              </h1>
              <p className="text-xl text-slate-400 mb-10 leading-relaxed font-medium">
                Welcome to the official Companion AI documentation. Learn how to leverage our high-fidelity neural networks to deconstruct complex architectures and accelerate your development cycle.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                        <ShieldCheck size={20} />
                    </div>
                    <h4 className="text-white font-bold mb-2">Secure by Design</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">End-to-end encrypted neural processing. Your intellectual property never leaves our secure perimeter.</p>
                </div>
                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                        <Cpu size={20} />
                    </div>
                    <h4 className="text-white font-bold mb-2">Neural Optimization</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">Proprietary RAG infrastructure designed specifically for high-density codebase deconstruction.</p>
                </div>
              </div>
            </section>

            {/* Getting Started */}
            <section id="getting-started" className="mb-24 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-8 flex items-center gap-3">
                <div className="w-1.5 h-8 bg-indigo-500 rounded-full" />
                Getting Started
              </h2>
              <p className="text-slate-400 mb-10 text-lg font-medium">Initialize your first workspace and experience the power of Companion in minutes.</p>
              
              <div className="space-y-4">
                {[
                  { step: "01", title: "Authentication", desc: "Secure your session by authenticating with your enterprise credentials." },
                  { step: "02", title: "Repository Sync", desc: "Paste your GitHub URL into the Console to establish a neural link." },
                  { step: "03", title: "Vector Indexing", desc: "Click 'Build Knowledge Base' to create a high-dimensional vector map of your repo." },
                  { step: "04", title: "Neural Analysis", desc: "Select files and launch the intelligence modules for deep insight generation." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 p-6 rounded-[2rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group">
                    <div className="text-3xl font-black text-white/5 group-hover:text-indigo-500/20 transition-colors shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg mb-1">{item.title}</h4>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Features */}
            <section id="features" className="mb-24 scroll-mt-24">
               <h2 className="text-2xl md:text-3xl font-black text-white mb-8 flex items-center gap-3">
                <div className="w-1.5 h-8 bg-purple-500 rounded-full" />
                Platform Features
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 hover:border-indigo-500/20 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6">
                    <Code size={24} />
                  </div>
                  <h3 className="font-bold text-white mb-3 text-lg">Cross-File Explanation</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">Deconstruct dependencies across multiple files simultaneously with global context awareness.</p>
                </div>
                
                <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 hover:border-red-500/20 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
                    <ShieldAlert size={24} />
                  </div>
                  <h3 className="font-bold text-white mb-3 text-lg">Structural Audits</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">Identify architectural fragility, potential race conditions, and memory leaks automatically.</p>
                </div>
                
                <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 hover:border-emerald-500/20 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
                    <CheckCircle size={24} />
                  </div>
                  <h3 className="font-bold text-white mb-3 text-lg">Neural Mind-Maps</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">Visualize the underlying logic of your codebase through AI-generated structural diagrams.</p>
                </div>
                
                <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 hover:border-purple-500/20 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6">
                    <Brain size={24} />
                  </div>
                  <h3 className="font-bold text-white mb-3 text-lg">Workspace Q&A</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">Query your entire indexed repository using natural language in our dedicated Neural Chat.</p>
                </div>
              </div>
            </section>

            {/* Engineering Guide */}
            <section id="how-to-use" className="mb-24 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-8 flex items-center gap-3">
                <div className="w-1.5 h-8 bg-emerald-500 rounded-full" />
                Engineering Guide
              </h2>
              <div className="bg-[#0D0D12] border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -mr-32 -mt-32 transition-all group-hover:bg-indigo-500/10" />
                <div className="space-y-6 relative z-10">
                  <p className="font-bold text-white text-lg">Standard Operating Procedure:</p>
                  <ol className="space-y-4">
                    {[
                        "Establish high-bandwidth repository connection",
                        "Initiate vector indexing for global context",
                        "Multi-select dependency-heavy modules",
                        "Execute high-density neural analysis",
                        "Export refined documentation or refactor logs"
                    ].map((text, i) => (
                        <li key={i} className="flex items-center gap-4 text-sm text-slate-400 font-medium">
                            <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-white font-black shrink-0">{i+1}</div>
                            {text}
                        </li>
                    ))}
                  </ol>
                </div>
              </div>
            </section>

            {/* Neural Intelligence / Code Block */}
            <section id="advanced-features" className="mb-24 scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-8 flex items-center gap-3">
                <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
                Neural Intelligence
              </h2>
              
              <p className="text-slate-400 mb-10 text-lg font-medium leading-relaxed">Integrate Companion high-fidelity analysis into your existing CI/CD automation suite.</p>
              
              <div className="rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 bg-[#08080C] relative group">
                <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border-b border-white/5">
                  <div className="flex items-center gap-2">
                      <div className="flex gap-1.5 mr-4">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
                      </div>
                      <span className="text-[10px] text-slate-500 font-black tracking-widest uppercase">integration-demo.js</span>
                  </div>
                  <button 
                    onClick={() => handleCopyCode(codeExample)}
                    className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    {copiedCode ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="p-8 overflow-x-auto custom-scrollbar">
                  <pre className="text-sm font-mono leading-relaxed">
                    <code>
                      <span className="text-slate-600">// Example: Neural Workspace Integration</span><br/>
                      <span className="text-indigo-400">const</span> <span className="text-slate-300">companion</span> <span className="text-indigo-400">=</span> <span className="text-indigo-400">require</span>(<span className="text-emerald-400">'companion-ai'</span>);<br/><br/>
                      <span className="text-indigo-400">const</span> <span className="text-slate-300">report</span> <span className="text-indigo-400">=</span> <span className="text-indigo-400">await</span> <span className="text-slate-300">companion</span>.<span className="text-purple-400">analyze</span>({'{'}<br/>
                      &nbsp;&nbsp;<span className="text-slate-300">repository</span>: <span className="text-emerald-400">'https://github.com/org/repo'</span>,<br/>
                      &nbsp;&nbsp;<span className="text-slate-300">intelligence</span>: <span className="text-emerald-400">'deep-neural'</span>,<br/>
                      &nbsp;&nbsp;<span className="text-slate-300">output</span>: <span className="text-emerald-400">'markdown'</span><br/>
                      {'}'});<br/><br/>
                      <span className="text-slate-300">console</span>.<span className="text-purple-400">log</span>(<span className="text-slate-300">report</span>.<span className="text-slate-300">summary</span>);
                    </code>
                  </pre>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="mb-24 scroll-mt-24">
               <h2 className="text-2xl md:text-3xl font-black text-white mb-8 flex items-center gap-3">
                <div className="w-1.5 h-8 bg-slate-500 rounded-full" />
                Technical FAQ
              </h2>
              
              <div className="space-y-4">
                {[
                    { q: "How does the Neural Workspace work?", a: "Companion uses a proprietary transformer architecture to generate high-dimensional vector embeddings of your codebase. This allows for semantic similarity matching and global context retrieval that standard static analysis tools cannot match." },
                    { q: "What is the security protocol for my code?", a: "We employ end-to-end encryption for all neural processing. Repository snapshots are ephemeral and stored only for the duration of the analysis session. We never utilize customer proprietary code to train our foundational models." },
                    { q: "Does it support private repositories?", a: "Yes. Companion supports OAuth and PAT-based authentication for private GitHub, GitLab, and Bitbucket instances, ensuring your internal code remains behind your organization's security layers." }
                ].map((item, i) => (
                    <details key={i} className="group bg-white/[0.01] border border-white/5 rounded-3xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer items-center justify-between gap-4 p-6 text-white font-bold text-sm">
                        {item.q}
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 transition duration-300 group-open:rotate-180">
                             <ChevronRight size={14} className="rotate-90" />
                        </div>
                    </summary>
                    <div className="px-6 pb-6 leading-relaxed text-slate-500 text-xs font-medium">
                        {item.a}
                    </div>
                    </details>
                ))}
              </div>
            </section>

          </div>
        </main>
      </div>

       <style>
            {`
            .custom-scrollbar::-webkit-scrollbar {
                height: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(255,255,255,0.05);
                border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(255,255,255,0.1);
            }
            `}
        </style>
    </div>
  );
};

export default Docs;
