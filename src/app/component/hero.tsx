"use client";

import React, { useState, useEffect, useRef } from 'react';
import createGlobe from 'cobe';

export default function HackWattHero() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);
  const [electricFlow, setElectricFlow] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  
  // Globe refs
  const canvasRef = useRef(null);
  const globeRef = useRef(null);
  const phiRef = useRef(0);
  const lastInteractionTimeRef = useRef(0);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const pointerInteractionMovement = useRef(0);
  const pointerDownPosition = useRef([0, 0]);

  const words = ["Import", "Connect", "Power", "Innovate"];
  
  // Network connection points
  const connectionPoints = [
    { lat: 40, lng: -100, intensity: 0.9 },
    { lat: 50, lng: 10, intensity: 0.8 },
    { lat: 35, lng: 105, intensity: 0.95 },
    { lat: -20, lng: 25, intensity: 0.7 },
    { lat: 60, lng: 30, intensity: 0.6 },
    { lat: 25, lng: 50, intensity: 0.85 },
    { lat: -30, lng: 140, intensity: 0.75 },
    { lat: 10, lng: 100, intensity: 0.8 }
  ];

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setIsLoaded(true);
    
    const wordInterval = setInterval(() => {
      setCurrentWord(prev => (prev + 1) % words.length);
    }, 2000);

    const flowInterval = setInterval(() => {
      setElectricFlow(prev => (prev + 1) % 100);
    }, 30);

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearInterval(wordInterval);
      clearInterval(flowInterval);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Initialize Cobe Globe
  useEffect(() => {
    if (!canvasRef.current) return;

    let width = 0;
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
        if (globeRef.current) {
          globeRef.current.width = width * 2;
          globeRef.current.height = width * 2;
        }
      }
    };
    
    window.addEventListener('resize', onResize);
    onResize();

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3,
      dark: 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 4,
      baseColor: [0.2, 0.2, 0.2],
      markerColor: [0.1, 0.8, 1],
      glowColor: [0.1, 0.8, 1],
      markers: connectionPoints.map((point) => ({
        location: [point.lat, point.lng],
        size: 0.03 + point.intensity * 0.02,
        color: [0.1, 0.8, 1]
      })),
      onRender: (state) => {
        const currentTime = Date.now();
        
        if (isPointerDown && pointerInteractionMovement.current !== 0) {
          phiRef.current += pointerInteractionMovement.current;
          pointerInteractionMovement.current *= 0.9;
          lastInteractionTimeRef.current = currentTime;
        }
        else if (currentTime - lastInteractionTimeRef.current > 1500) {
          phiRef.current += isMobile ? 0.003 : 0.005;
        }
        
        state.phi = phiRef.current;
      }
    });

    globeRef.current = globe;

    // Interaction handlers
    const handlePointerEvent = (e) => {
      if (e instanceof MouseEvent) {
        return { x: e.clientX, y: e.clientY };
      } else {
        return e.touches[0] ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
      }
    };

    const onPointerDown = (e) => {
      setIsPointerDown(true);
      const pos = handlePointerEvent(e);
      if (pos) {
        pointerDownPosition.current = [pos.x, pos.y];
        if (canvasRef.current) {
          canvasRef.current.style.cursor = 'grabbing';
        }
      }
    };

    const onPointerUp = () => {
      setIsPointerDown(false);
      pointerInteractionMovement.current = 0;
      lastInteractionTimeRef.current = Date.now();
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grab';
      }
    };

    const onPointerMove = (e) => {
      if (!isPointerDown) return;
      
      const pos = handlePointerEvent(e);
      if (pos) {
        const deltaX = pos.x - pointerDownPosition.current[0];
        pointerInteractionMovement.current = deltaX * (isMobile ? 0.004 : 0.008);
        pointerDownPosition.current[0] = pos.x;
      }
    };

    if (canvasRef.current) {
      canvasRef.current.addEventListener('mousedown', onPointerDown);
      canvasRef.current.addEventListener('touchstart', onPointerDown, { passive: false });
      canvasRef.current.style.cursor = 'grab';
    }
    
    document.addEventListener('mouseup', onPointerUp);
    document.addEventListener('touchend', onPointerUp);
    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('touchmove', onPointerMove, { passive: false });

    return () => {
      if (globeRef.current) {
        globeRef.current.destroy();
      }
      window.removeEventListener('resize', onResize);
      
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('mousedown', onPointerDown);
        canvasRef.current.removeEventListener('touchstart', onPointerDown);
      }
      document.removeEventListener('mouseup', onPointerUp);
      document.removeEventListener('touchend', onPointerUp);
      document.removeEventListener('mousemove', onPointerMove);
      document.removeEventListener('touchmove', onPointerMove);
    };
  }, [isPointerDown, isMobile]);

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Globe Background - Full width with bottom half cut off */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
<div className="absolute inset-0 w-full h-[200%] top-0">


          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        
        {/* Gradient overlay to fade the bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full min-h-screen flex items-center px-4 sm:px-6 md:px-8 lg:px-16 py-16">
        {/* Main Content Grid - Stack on mobile, side-by-side on larger screens */}
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          
          {/* Left Side - Text Content */}
          <div className="space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12 order-2 lg:order-1">
            {/* Main Heading */}
            <div className={`transition-all duration-1500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-4 sm:mb-6 leading-tight">
                We{" "}
                <span className="relative inline-block">
                  <span 
                    className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400"
                    key={currentWord}
                    style={{
                      backgroundSize: '200% 200%',
                      animation: 'gradient 3s ease infinite'
                    }}
                  >
                    {words[currentWord]}
                  </span>
                </span>
              </h1>
              <div className="space-y-3 sm:space-y-4">
                <p className="text-xl sm:text-2xl md:text-3xl text-gray-200 font-light leading-relaxed">
                  Electric Devices Worldwide
                </p>
                <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-lg">
                  Seamlessly connecting electrical systems across continents with cutting-edge technology and reliable infrastructure.
                </p>
              </div>
            </div>

            {/* Enhanced Electric Flow */}
            <div className={`transition-all duration-1700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="relative">
                <div className="h-16 sm:h-20 bg-gradient-to-r from-gray-900/30 via-transparent to-gray-900/30 rounded-3xl overflow-hidden backdrop-blur-sm border border-blue-400/30">
                  <div className="absolute inset-0">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                        style={{
                          top: `${25 + i * 20}%`,
                          width: `${40 + i * 5}%`,
                          left: `${electricFlow - 40 - i * 5 + Math.sin(Date.now() * 0.002 + i) * 8}%`,
                          boxShadow: `0 0 ${12 + i * 4}px rgba(59, 130, 246, ${0.8 - i * 0.15})`,
                          opacity: 0.8 - i * 0.15
                        }}
                      />
                    ))}
                  </div>
                  
                  <div className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 sm:space-x-3">
                    <div className="w-2 sm:w-3 h-2 sm:h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-200">Source</span>
                  </div>
                  
                  <div className="absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 sm:space-x-3">
                    <span className="text-xs sm:text-sm font-medium text-gray-200">Global Network</span>
                    <div className="w-2 sm:w-3 h-2 sm:h-3 bg-gradient-to-r from-cyan-300 to-cyan-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Stack on small screens, inline on larger */}
            <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 transition-all duration-1900 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <button className="group relative w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-2xl font-bold text-base sm:text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center justify-center">
                  <span>Start Your Journey</span>
                  <div className="ml-2 sm:ml-4 w-5 sm:w-6 h-5 sm:h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-1 sm:group-hover:translate-x-2 transition-transform">
                    <svg className="w-2 sm:w-3 h-2 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </button>
              
              <button className="group w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 md:py-5 bg-white/20 backdrop-blur-sm border-2 border-gray-200/30 text-white rounded-2xl font-semibold text-base sm:text-lg hover:border-cyan-400/50 hover:bg-cyan-500/20 transition-all duration-300">
                <span className="group-hover:text-cyan-300 transition-colors">Learn More</span>
              </button>
            </div>
          </div>

          {/* Right Side - Additional Content (hidden on smallest screens) */}
          <div className={`relative transition-all duration-2100 delay-700 order-1 lg:order-2 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Connection indicators */}
            <div className="hidden sm:block absolute -top-4 -right-4 w-3 sm:w-4 h-3 sm:h-4 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
            <div className="hidden sm:block absolute top-1/2 -left-4 w-2 sm:w-3 h-2 sm:h-3 bg-blue-500 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '1s' }}></div>
            <div className="hidden sm:block absolute top-1/4 -right-6 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-cyan-400 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '2s' }}></div>

         
          </div>
        </div>
      </div>

      {/* Enhanced Animations */}
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}