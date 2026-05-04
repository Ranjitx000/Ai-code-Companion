import React from 'react';
import LoginPage from '@/components/ui/LoginPage';

const AuthModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in cursor-pointer" onClick={onClose}>
      <div 
        className="w-full max-w-[1000px] cursor-default" 
        onClick={(e) => e.stopPropagation()}
      >
        <LoginPage onClose={onClose} />
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AuthModal;
