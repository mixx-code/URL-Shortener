'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Settings, BarChart3, LogOut, ArrowLeft, Link2 } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
  createButtonText?: string;
  showBackButton?: boolean;
}

export default function Header({ 
  title, 
  subtitle, 
  showCreateButton = false, 
  onCreateClick,
  createButtonText = "Create New URL",
  showBackButton = false
}: HeaderProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; username: string; email: string } | null>(null);

  // Load user data from API on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch('http://localhost:3000/api/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.status && data.user) {
              setUser(data.user);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Function to generate avatar background color based on username
  const getAvatarColor = (username: string) => {
    if (!username) return 'from-gray-400 to-gray-600';
    
    const colors = [
      'from-red-400 to-red-600',
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600',
      'from-yellow-400 to-yellow-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-indigo-400 to-indigo-600',
      'from-teal-400 to-teal-600',
      'from-orange-400 to-orange-600',
      'from-cyan-400 to-cyan-600'
    ];
    
    // Generate index based on first character of username
    const charCode = username.charCodeAt(0);
    const colorIndex = charCode % colors.length;
    
    return colors[colorIndex];
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo/Title Section */}
          <div className="flex items-center flex-1 min-w-0">
            {showBackButton && (
              <button
                onClick={handleBackToDashboard}
                className="mr-2 sm:mr-4 p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 flex-shrink-0"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            
            <div className="flex flex-col truncate w-full">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1 truncate">{subtitle}</p>
              )}
            </div>
          </div>
          
          {/* Actions Section */}
          <div className="flex items-center space-x-2 sm:space-x-3 ml-2 sm:ml-4 flex-shrink-0">
            {showCreateButton && onCreateClick && (
              <button
                onClick={onCreateClick}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 whitespace-nowrap"
              >
                <span className="flex items-center">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">{createButtonText}</span>
                  <span className="sm:hidden">Create</span>
                </span>
              </button>
            )}
            
            {/* Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${getAvatarColor(user?.username || '')} rounded-full hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl transform focus:outline-none focus:ring-2 focus:ring-offset-2`}
                aria-label="User menu"
                aria-expanded={dropdownOpen}
              >
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
              
              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  {/* Backdrop to close dropdown when clicking outside */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={closeDropdown}
                  />
                  
                  <div className="absolute right-0 z-20 mt-3 w-48 sm:w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="py-2">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 bg-gradient-to-br ${getAvatarColor(user?.username || '')} rounded-full flex items-center justify-center`}>
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{user?.name || user?.username || 'User'}</p>
                            <p className="text-xs text-gray-500">{user?.email || 'Account'}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <Link
                        href="/profile"
                        onClick={closeDropdown}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
                      >
                        <User className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        <span className="font-medium">Profile</span>
                      </Link>
                      
                      <Link
                        href="/analytics"
                        onClick={closeDropdown}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
                      >
                        <BarChart3 className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        <span className="font-medium">Analytics</span>
                      </Link>
                      
                      <div className="border-t border-gray-100 my-2"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors group"
                      >
                        <LogOut className="w-5 h-5 mr-3 text-red-500 group-hover:text-red-600 transition-colors" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
