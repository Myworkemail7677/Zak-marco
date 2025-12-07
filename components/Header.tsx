
import React, { useState } from 'react';

interface HeaderProps {
  onStartLiveCall?: () => void;
  onSearch: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onStartLiveCall, onSearch }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm);
      setSearchTerm('');
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="bg-white border-b border-teal-100 shadow-sm sticky top-0 z-10 flex-shrink-0">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between h-[72px]">
        {isSearchOpen ? (
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-3 animate-fade-in w-full">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-teal-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                autoFocus
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Find a specialist (e.g. Neurologist)..."
                className="block w-full pl-9 pr-3 py-2 border border-teal-200 rounded-full leading-5 bg-teal-50 placeholder-teal-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition duration-150 ease-in-out text-slate-700"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors px-2"
            >
              Cancel
            </button>
          </form>
        ) : (
          <>
            <div className="flex items-center space-x-3">
              <div className="bg-teal-500 rounded-full p-2 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-teal-900 leading-tight">Health Guide</h1>
                <p className="text-xs text-teal-600 font-medium">Specialist Finder Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-teal-600 hover:bg-teal-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                aria-label="Search specialists"
                title="Search specialists"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
                </svg>
              </button>

              {onStartLiveCall && (
                <button
                  onClick={onStartLiveCall}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-full hover:bg-teal-700 transition-colors shadow-sm animate-pulse-slow"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M10 2a8 8 0 0 0-8 8c0 1.392.352 2.69.969 3.824L1.87 17.5a.75.75 0 0 0 .973.972l3.677-1.096A8 8 0 0 0 10 18a8 8 0 0 0 8-8 8 8 0 0 0-8-8ZM5.12 10.762a.75.75 0 0 1-.955.53l-1.353-.404a6.5 6.5 0 0 1 0-3.776l1.353-.404a.75.75 0 0 1 .955.53l.635 2.12a.75.75 0 0 1-.22.846l-.503.402a4.973 4.973 0 0 0 2.228 2.228l.402-.503a.75.75 0 0 1 .846-.22l2.12.635Z" clipRule="evenodd" />
                  </svg>
                  Talk with Guide
                </button>
              )}
              <div className="hidden sm:block">
                <span className="inline-flex items-center rounded-md bg-teal-50 px-2 py-1 text-xs font-medium text-teal-700 ring-1 ring-inset ring-teal-600/20">
                  Beta
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile-only CTA - Hide when search is open to avoid clutter */}
      {!isSearchOpen && (
        <div className="sm:hidden px-4 pb-2">
          {onStartLiveCall && (
            <button
              onClick={onStartLiveCall}
              className="w-full flex justify-center items-center gap-2 px-3 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 2a8 8 0 0 0-8 8c0 1.392.352 2.69.969 3.824L1.87 17.5a.75.75 0 0 0 .973.972l3.677-1.096A8 8 0 0 0 10 18a8 8 0 0 0 8-8 8 8 0 0 0-8-8ZM5.12 10.762a.75.75 0 0 1-.955.53l-1.353-.404a6.5 6.5 0 0 1 0-3.776l1.353-.404a.75.75 0 0 1 .955.53l.635 2.12a.75.75 0 0 1-.22.846l-.503.402a4.973 4.973 0 0 0 2.228 2.228l.402-.503a.75.75 0 0 1 .846-.22l2.12.635Z" clipRule="evenodd" />
              </svg>
              Talk with Health Guide
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
