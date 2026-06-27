"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Sparkles, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/AuthContext";
import { useNavigate } from "react-router-dom";

const Pupil = ({ 
  size = 12, 
  maxDistance = 5,
  pupilColor = "black",
  forceLookX,
  forceLookY
}) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const pupilRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const calculatePupilPosition = () => {
    if (!pupilRef.current) return { x: 0, y: 0 };

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const pupil = pupilRef.current.getBoundingClientRect();
    const pupilCenterX = pupil.left + pupil.width / 2;
    const pupilCenterY = pupil.top + pupil.height / 2;

    const deltaX = mouseX - pupilCenterX;
    const deltaY = mouseY - pupilCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    />
  );
};

const EyeBall = ({ 
  size = 48, 
  pupilSize = 16, 
  maxDistance = 10,
  eyeColor = "white",
  pupilColor = "black",
  isBlinking = false,
  forceLookX,
  forceLookY
}) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const eyeRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const calculatePupilPosition = () => {
    if (!eyeRef.current) return { x: 0, y: 0 };

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const eye = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eye.left + eye.width / 2;
    const eyeCenterY = eye.top + eye.height / 2;

    const deltaX = mouseX - eyeCenterX;
    const deltaY = mouseY - eyeCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={eyeRef}
      className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{
        width: `${size}px`,
        height: isBlinking ? '2px' : `${size}px`,
        backgroundColor: eyeColor,
        overflow: 'hidden',
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      )}
    </div>
  );
};

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
    />
  </svg>
);

const GoogleIcon = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.09H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.91l3.66-2.8z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.09l3.66 2.84c.87-2.6 3.3-4.55 6.16-4.55z"
    />
  </svg>
);

export default function LoginPage({ onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setLocalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);
  const purpleRef = useRef(null);
  const blackRef = useRef(null);
  const yellowRef = useRef(null);
  const orangeRef = useRef(null);

  const { loginWithGoogle, loginWithGithub, loginWithEmail, signupWithEmail } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsPurpleBlinking(true);
        setTimeout(() => {
          setIsPurpleBlinking(false);
          scheduleBlink();
        }, 150);
      }, Math.random() * 4000 + 3000);
      return blinkTimeout;
    };
    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const scheduleBlink = () => {
      const blinkTimeout = setTimeout(() => {
        setIsBlackBlinking(true);
        setTimeout(() => {
          setIsBlackBlinking(false);
          scheduleBlink();
        }, 150);
      }, Math.random() * 4000 + 3000);
      return blinkTimeout;
    };
    const timeout = scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true);
      const timer = setTimeout(() => {
        setIsLookingAtEachOther(false);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setIsLookingAtEachOther(false);
    }
  }, [isTyping]);

  useEffect(() => {
    if (password.length > 0 && showPassword) {
      const schedulePeek = () => {
        const peekInterval = setTimeout(() => {
          setIsPurplePeeking(true);
          setTimeout(() => {
            setIsPurplePeeking(false);
          }, 800);
        }, Math.random() * 3000 + 2000);
        return peekInterval;
      };
      const firstPeek = schedulePeek();
      return () => clearTimeout(firstPeek);
    } else {
      setIsPurplePeeking(false);
    }
  }, [password, showPassword]);

  const calculatePosition = (ref) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;
    const faceX = Math.max(-15, Math.min(15, deltaX / 20));
    const faceY = Math.max(-10, Math.min(10, deltaY / 30));
    const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));
    return { faceX, faceY, bodySkew };
  };

  const purplePos = calculatePosition(purpleRef);
  const blackPos = calculatePosition(blackRef);
  const yellowPos = calculatePosition(yellowRef);
  const orangePos = calculatePosition(orangeRef);

  const navigateAfterLogin = (user) => {
    const key = `confetti_shown_${user.uid}`;
    const alreadyShown = localStorage.getItem(key);
    if (!alreadyShown) {
      localStorage.setItem(key, 'true');
      navigate('/Codeview', { state: { showConfetti: true } });
    } else {
      navigate('/Codeview');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setLoading(true);
    try {
      let result;
      if (isLogin) {
        result = await loginWithEmail(email, password);
      } else {
        result = await signupWithEmail(email, password);
      }
      onClose();
      navigateAfterLogin(result.user);
    } catch (err) {
      setLocalError(err.message.replace('Firebase:', '').trim());
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await loginWithGoogle();
      onClose();
      navigateAfterLogin(result.user);
    } catch (err) {
      setLocalError(err.message);
    }
  };

  const handleGithubLogin = async () => {
    try {
      const result = await loginWithGithub();
      onClose();
      navigateAfterLogin(result.user);
    } catch (err) {
      setLocalError(err.message);
    }
  };

  return (
    <div className="w-full max-w-[1000px] h-[600px] grid lg:grid-cols-2 rounded-3xl overflow-hidden relative font-sans"
         style={{ background: '#dde1e7', boxShadow: '10px 10px 30px rgba(0,0,0,0.15), -10px -10px 30px rgba(255,255,255,0.1)' }}>
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900 transition-all z-[100] rounded-full"
        style={{
          background: '#dde1e7',
          boxShadow: '3px 3px 8px #b8bec9, -3px -3px 8px #ffffff'
        }}
        onMouseDown={e => e.currentTarget.style.boxShadow = 'inset 2px 2px 5px #b8bec9, inset -2px -2px 5px #ffffff'}
        onMouseUp={e => e.currentTarget.style.boxShadow = '3px 3px 8px #b8bec9, -3px -3px 8px #ffffff'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = '3px 3px 8px #b8bec9, -3px -3px 8px #ffffff'}
      >
        <X size={20} />
      </button>

      {/* Left Content Section */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 text-gray-900 overflow-hidden"
           style={{
             background: '#dde1e7',
             boxShadow: 'inset -5px 0 10px -5px #b8bec9'
           }}>
        <div className="relative z-20">
          <div className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span>AI Code <span className="text-gray-500">Companion</span></span>
          </div>
        </div>

        <div className="relative z-20 flex items-end justify-center h-[400px]">
          <div className="relative scale-75 md:scale-95 lg:scale-100" style={{ width: '550px', height: '350px' }}>
            {/* Purple character */}
            <div 
              ref={purpleRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out shadow-sm"
              style={{
                left: '70px',
                width: '180px',
                height: (isTyping || (password.length > 0 && !showPassword)) ? '390px' : '350px',
                backgroundColor: '#6C3FF5',
                borderRadius: '16px 16px 0 0',
                zIndex: 1,
                transform: (password.length > 0 && showPassword)
                  ? `skewX(0deg)`
                  : (isTyping || (password.length > 0 && !showPassword))
                    ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)` 
                    : `skewX(${purplePos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div 
                className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                style={{
                  left: (password.length > 0 && showPassword) ? `${20}px` : isLookingAtEachOther ? `${55}px` : `${45 + purplePos.faceX}px`,
                  top: (password.length > 0 && showPassword) ? `${35}px` : isLookingAtEachOther ? `${65}px` : `${40 + purplePos.faceY}px`,
                }}
              >
                <EyeBall size={18} pupilSize={7} maxDistance={5} isBlinking={isPurpleBlinking} forceLookX={(password.length > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined} forceLookY={(password.length > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined} />
                <EyeBall size={18} pupilSize={7} maxDistance={5} isBlinking={isPurpleBlinking} forceLookX={(password.length > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined} forceLookY={(password.length > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined} />
              </div>
            </div>

            {/* Black character */}
            <div 
              ref={blackRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out shadow-sm"
              style={{
                left: '240px',
                width: '120px',
                height: '260px',
                backgroundColor: '#2D2D2D',
                borderRadius: '12px 12px 0 0',
                zIndex: 2,
                transform: (password.length > 0 && showPassword)
                  ? `skewX(0deg)`
                  : isLookingAtEachOther
                    ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                    : (isTyping || (password.length > 0 && !showPassword))
                      ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)` 
                      : `skewX(${blackPos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div 
                className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                style={{
                  left: (password.length > 0 && showPassword) ? `${10}px` : isLookingAtEachOther ? `${32}px` : `${26 + blackPos.faceX}px`,
                  top: (password.length > 0 && showPassword) ? `${28}px` : isLookingAtEachOther ? `${12}px` : `${32 + blackPos.faceY}px`,
                }}
              >
                <EyeBall size={16} pupilSize={6} maxDistance={4} isBlinking={isBlackBlinking} forceLookX={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined} />
                <EyeBall size={16} pupilSize={6} maxDistance={4} isBlinking={isBlackBlinking} forceLookX={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined} />
              </div>
            </div>

            {/* Orange character */}
            <div 
              ref={orangeRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out shadow-sm"
              style={{
                left: '0px',
                width: '200px',
                height: '160px',
                zIndex: 3,
                backgroundColor: '#FF9B6B',
                borderRadius: '100px 100px 0 0',
                transform: (password.length > 0 && showPassword) ? `skewX(0deg)` : `skewX(${orangePos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div 
                className="absolute flex gap-8 transition-all duration-200 ease-out"
                style={{
                  left: (password.length > 0 && showPassword) ? `${40}px` : `${72 + (orangePos.faceX || 0)}px`,
                  top: (password.length > 0 && showPassword) ? `${65}px` : `${70 + (orangePos.faceY || 0)}px`,
                }}
              >
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
              </div>
            </div>

            {/* Yellow character */}
            <div 
              ref={yellowRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out shadow-sm"
              style={{
                left: '310px',
                width: '120px',
                height: '190px',
                backgroundColor: '#E8D754',
                borderRadius: '60px 60px 0 0',
                zIndex: 4,
                transform: (password.length > 0 && showPassword) ? `skewX(0deg)` : `skewX(${yellowPos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div 
                className="absolute flex gap-6 transition-all duration-200 ease-out"
                style={{
                  left: (password.length > 0 && showPassword) ? `${15}px` : `${42 + (yellowPos.faceX || 0)}px`,
                  top: (password.length > 0 && showPassword) ? `${30}px` : `${35 + (yellowPos.faceY || 0)}px`,
                }}
              >
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
                <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={(password.length > 0 && showPassword) ? -5 : undefined} forceLookY={(password.length > 0 && showPassword) ? -4 : undefined} />
              </div>
              <div 
                className="absolute w-16 h-[4px] bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
                style={{
                  left: (password.length > 0 && showPassword) ? `${8}px` : `${30 + (yellowPos.faceX || 0)}px`,
                  top: (password.length > 0 && showPassword) ? `${75}px` : `${75 + (yellowPos.faceY || 0)}px`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Section */}
      <div className="flex flex-col items-center justify-center p-8 overflow-y-auto" style={{ background: '#dde1e7' }}>
        <div className="w-full max-w-[360px]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-gray-700 mb-2 tracking-tight">{isLogin ? 'Welcome back' : 'Create account'}</h1>
            <p className="text-gray-500 text-sm font-medium">{isLogin ? 'Please enter your details to continue.' : 'Join AI Code Companion today.'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-2">Email</Label>
              <div 
                className="rounded-xl overflow-hidden"
                style={{ boxShadow: 'inset 4px 4px 10px #b8bec9, inset -4px -4px 10px #ffffff' }}
              >
                <Input
                  id="email"
                  type="email"
                  placeholder="anna@example.com"
                  value={email}
                  autoComplete="off"
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                  required
                  className="h-12 w-full bg-transparent border-none text-gray-700 font-medium placeholder:text-gray-400 focus-visible:ring-0 px-4"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" title="password" className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-2">Password</Label>
              <div 
                className="relative rounded-xl overflow-hidden"
                style={{ boxShadow: 'inset 4px 4px 10px #b8bec9, inset -4px -4px 10px #ffffff' }}
              >
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 w-full pr-12 bg-transparent border-none text-gray-700 font-medium placeholder:text-gray-400 focus-visible:ring-0 px-4"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-2"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <div className="p-3 text-sm text-red-600 bg-red-50/50 border border-red-100 rounded-xl font-medium">{error}</div>}

            <button 
              type="submit" 
              className="w-full h-12 text-gray-600 font-bold tracking-wide rounded-xl transition-all mt-4" 
              disabled={loading}
              style={{
                background: '#dde1e7',
                boxShadow: '4px 4px 10px #b8bec9, -4px -4px 10px #ffffff'
              }}
              onMouseDown={e => {
                if (!loading) e.currentTarget.style.boxShadow = 'inset 3px 3px 8px #b8bec9, inset -3px -3px 8px #ffffff';
              }}
              onMouseUp={e => {
                if (!loading) e.currentTarget.style.boxShadow = '4px 4px 10px #b8bec9, -4px -4px 10px #ffffff';
              }}
              onMouseLeave={e => {
                if (!loading) e.currentTarget.style.boxShadow = '4px 4px 10px #b8bec9, -4px -4px 10px #ffffff';
              }}
            >
              {loading ? "Processing..." : isLogin ? "Log in" : "Sign up"}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-[2px]" style={{ background: '#dde1e7', boxShadow: 'inset 1px 1px 3px #b8bec9, inset -1px -1px 3px #ffffff' }}></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
              <span className="px-4 text-gray-500" style={{ background: '#dde1e7' }}>Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button" 
              onClick={handleGoogleLogin}
              className="flex items-center justify-center h-12 text-gray-600 font-bold tracking-wide rounded-xl transition-all"
              style={{ background: '#dde1e7', boxShadow: '4px 4px 10px #b8bec9, -4px -4px 10px #ffffff' }}
              onMouseDown={e => e.currentTarget.style.boxShadow = 'inset 3px 3px 8px #b8bec9, inset -3px -3px 8px #ffffff'}
              onMouseUp={e => e.currentTarget.style.boxShadow = '4px 4px 10px #b8bec9, -4px -4px 10px #ffffff'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '4px 4px 10px #b8bec9, -4px -4px 10px #ffffff'}
            >
              <GoogleIcon className="mr-2 size-4" /> Google
            </button>
            <button 
              type="button" 
              onClick={handleGithubLogin}
              className="flex items-center justify-center h-12 text-gray-600 font-bold tracking-wide rounded-xl transition-all"
              style={{ background: '#dde1e7', boxShadow: '4px 4px 10px #b8bec9, -4px -4px 10px #ffffff' }}
              onMouseDown={e => e.currentTarget.style.boxShadow = 'inset 3px 3px 8px #b8bec9, inset -3px -3px 8px #ffffff'}
              onMouseUp={e => e.currentTarget.style.boxShadow = '4px 4px 10px #b8bec9, -4px -4px 10px #ffffff'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '4px 4px 10px #b8bec9, -4px -4px 10px #ffffff'}
            >
              <GithubIcon className="mr-2 size-4 text-gray-700" /> GitHub
            </button>
          </div>

          <div className="text-center text-sm font-medium text-gray-500 mt-8">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-gray-900 font-bold hover:underline">
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
