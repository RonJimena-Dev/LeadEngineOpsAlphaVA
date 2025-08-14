'use client';

import { useState } from 'react';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', href: '#', icon: '📊' },
    { name: 'Generate Leads', href: '#', icon: '🚀' },
    { name: 'My Leads', href: '#', icon: '📋' },
    { name: 'Analytics', href: '#', icon: '📈' },
    { name: 'Settings', href: '#', icon: '⚙️' }
  ];

  return (
    <nav className="relative">
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-6">
        {menuItems.map((item) => (
          <a
            key={item.name}
            href={item.href}
            className="text-blue-100 hover:text-white transition-colors duration-200 flex items-center space-x-2"
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </a>
        ))}
        
        {/* User Menu */}
        <div className="relative group">
          <button className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors duration-200">
            <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
              <span className="text-blue-800 font-semibold">U</span>
            </div>
            <span>User</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-2">
              <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                Profile Settings
              </a>
              <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                API Keys
              </a>
              <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                Billing
              </a>
              <div className="border-t border-gray-200 my-1"></div>
              <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">
                Sign Out
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-blue-100 hover:text-white focus:outline-none focus:text-white"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 md:hidden">
          <div className="py-2">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center space-x-3"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </a>
            ))}
            
            <div className="border-t border-gray-200 my-2"></div>
            
            {/* Mobile User Menu */}
            <div className="px-4 py-2">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                  <span className="text-blue-800 font-semibold">U</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">User</div>
                  <div className="text-xs text-gray-500">user@example.com</div>
                </div>
              </div>
              
              <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm">
                Profile Settings
              </a>
              <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm">
                API Keys
              </a>
              <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm">
                Billing
              </a>
              <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm">
                Sign Out
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
