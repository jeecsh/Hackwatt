"use client";

import React, { useState, useEffect } from 'react';
import { Montserrat } from 'next/font/google';
import Image from 'next/image';
import { Download } from 'lucide-react';

const montserrat = Montserrat({ subsets: ['latin'] });

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <nav className={`fixed top-0 left-6 right-6 z-50 transition-all duration-500 ${montserrat.className} ${
      scrolled 
        ? 'bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
        scrolled ? 'py-3 rounded-full m-2' : 'py-4'
      }`}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Image 
                src="/icon.svg" 
                alt="HACKWATT Logo" 
                width={40} 
                height={40} 
                className="rounded-full"
              />
            </div>
            <span className="ml-3 text-xl font-bold text-white">HACKWATT</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <a 
                href="#" 
                className="text-white hover:text-cyan-200 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                About
              </a>
              <a 
                href="#" 
                className="text-white hover:text-cyan-200 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Products
              </a>
              <a 
                href="#" 
                className="text-white hover:text-cyan-200 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Contact
              </a>
              <a 
                href="#" 
                className="flex items-center text-white hover:text-cyan-200 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                <Download className="mr-1" size={18} />
              </a>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-white hover:text-cyan-200 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}