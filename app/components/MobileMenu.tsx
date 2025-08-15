'use client';

import { useState } from 'react';

interface MobileMenuProps {
  onNavigate: (view: 'dashboard' | 'generate' | 'leads') => void;
  currentView: 'dashboard' | 'generate' | 'leads';
}

export default function MobileMenu({ onNavigate, currentView }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: '📊 Dashboard', view: 'dashboard' as const },
    { id: 'generate', label: '🚀 Generate Leads', view: 'generate' as const },
    { id: 'leads', label: '📋 My Leads', view: 'leads' as const }
  ];

  const handleNavigation = (view: 'dashboard' | 'generate' | 'leads') => {
    onNavigate(view);
    setIsOpen(false);
  };

  return (
    <div className="md:hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        aria-label="Toggle mobile menu"
      >
        <span className="text-xl">{isOpen ? '✕' : '☰'}</span>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsOpen(false)}>
          <div className="absolute right-4 top-20 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 min-w-[200px] overflow-hidden">
            <div className="py-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.view)}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                    currentView === item.view
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
