"use client";

import { useState } from "react";
import { ArrowRight, Menu, X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const Hero2 = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Living background with floating blobs */}
      <div className="flex flex-col items-end absolute -right-60 -top-10 blur-[100px] z-0 pointer-events-none">
        <motion.div 
          animate={{ 
            x: [0, 50, -20, 0],
            y: [0, -30, 40, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="h-[15rem] rounded-full w-[70rem] z-1 bg-gradient-to-b from-purple-600/30 to-sky-600/30 blur-[6rem]"
        ></motion.div>
        
        <motion.div 
          animate={{ 
            x: [0, -40, 60, 0],
            y: [0, 50, -20, 0],
            scale: [1, 0.9, 1.1, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
          className="h-[15rem] rounded-full w-[100rem] z-1 bg-gradient-to-b from-pink-900/40 to-yellow-400/20 blur-[6rem]"
        ></motion.div>

        <motion.div 
          animate={{ 
            x: [0, 60, -30, 0],
            y: [0, 30, 50, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 5 }}
          className="h-[15rem] rounded-full w-[70rem] z-1 bg-gradient-to-b from-yellow-600/20 to-sky-500/30 blur-[6rem]"
        ></motion.div>
      </div>
      <div className="absolute inset-0 z-0 bg-noise opacity-20 pointer-events-none"></div>

      {/* Content container */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto flex items-center justify-between px-4 py-4 mt-6">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-purple-500/20">
              <Zap className="h-6 w-6 stroke-[2.5]" />
            </div>
            <span className="ml-3 text-2xl font-bold tracking-tight text-white">LeadGenie</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              <NavItem label="Use Cases" hasDropdown />
              <NavItem label="Products" hasDropdown />
              <NavItem label="Resources" hasDropdown />
              <NavItem label="Pricing" />
            </div>
            <div className="flex items-center space-x-3">
              <button className="h-11 rounded-full px-6 text-sm font-medium text-white hover:text-white/80 transition-colors">
                Login
              </button>
              <button className="h-11 rounded-full bg-white px-6 text-sm font-medium text-black hover:bg-white/90 transition-all">
                Sign Up
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg bg-white/5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Toggle menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
        </nav>

        {/* Mobile Navigation Menu with animation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex flex-col p-4 bg-black/95 md:hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                    <Zap className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <span className="ml-3 text-2xl font-bold text-white">
                    LeadGenie
                  </span>
                </div>
                <button 
                  className="p-2 rounded-lg bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="mt-12 flex flex-col space-y-6">
                <MobileNavItem label="Use Cases" />
                <MobileNavItem label="Products" />
                <MobileNavItem label="Resources" />
                <MobileNavItem label="Pricing" />
                <div className="pt-6 flex flex-col space-y-4">
                  <button className="h-12 w-full rounded-full border border-gray-700 text-white font-medium hover:bg-white/5 transition-colors">
                    Log in
                  </button>
                  <button className="h-12 w-full rounded-full bg-white text-black font-bold hover:bg-white/90 transition-all">
                    Get Started For Free
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mt-12 flex max-w-fit items-center justify-center space-x-2 rounded-full bg-white/10 border border-white/5 px-4 py-2 backdrop-blur-sm"
        >
          <span className="text-sm font-medium text-white">
            Join the revolution today!
          </span>
          <ArrowRight className="h-4 w-4 text-white" />
        </motion.div>

        {/* Hero section */}
        <div className="container mx-auto mt-12 px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-4xl text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl"
          >
            Unbeatable Pricing for <span className="bg-gradient-to-r from-sky-400 to-purple-500 bg-clip-text text-transparent">Dynamic Email Tools</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-gray-400/90 leading-relaxed"
          >
            Delivering unmatched email campaigns every day at unbeatable rates.
            Our tool redefines cost-effectiveness and scalability for your business.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
          >
            <button className="h-14 rounded-full bg-white px-8 text-base font-bold text-black hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              Start Your 7 Day Free Trial
            </button>
            <button className="h-14 rounded-full border border-gray-700 bg-white/5 px-8 text-base font-medium text-white hover:bg-white/10 transition-all backdrop-blur-sm">
              Watch Demo
            </button>
          </motion.div>

          {/* Hero Image / Dashboard Mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="relative mx-auto my-24 w-full max-w-6xl px-4"
          >
            <div className="absolute inset-0 rounded-[2rem] shadow-[0_0_100px_rgba(56,189,248,0.1)] bg-sky-500/20 blur-[8rem] opacity-30" />
            <div className="relative group overflow-hidden rounded-3xl border border-white/10 bg-black/40 p-2 backdrop-blur-3xl shadow-2xl transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_50px_rgba(56,189,248,0.15)]">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"
                alt="LeadGenie SaaS Dashboard"
                className="w-full h-auto rounded-2xl grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 scale-[1.01] group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

function NavItem({
  label,
  hasDropdown,
}: {
  label: string;
  hasDropdown?: boolean;
}) {
  return (
    <div className="flex items-center text-sm font-medium text-gray-400 hover:text-white cursor-pointer transition-colors group">
      <span>{label}</span>
      {hasDropdown && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-1 group-hover:translate-y-0.5 transition-transform duration-200"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      )}
    </div>
  );
}

function MobileNavItem({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-4 text-lg font-medium text-white hover:text-sky-400 cursor-pointer transition-colors">
      <span>{label}</span>
      <ArrowRight className="h-5 w-5 text-gray-500" />
    </div>
  );
}

export { Hero2 };
