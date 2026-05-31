'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Home, Library, PlusCircle, Menu, X, User, LogOut, UserCircle } from 'lucide-react';
import { logoutUser } from '@/store/authSlice';
import { clearBooks } from '@/store/booksSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import logo from '../public/image.png';
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, loading, isAuthenticated } = useSelector((state) => state.auth || { 
    user: null, 
    loading: true, 
    isAuthenticated: false 
  });
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/', icon: Home, label: 'الرئيسية' },
    { href: '/library', icon: Library, label: 'مكتبتي' },
  ];

  return (
    <div className="relative">
      {/* Header */}
      <header 
        className={`
          fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-in-out
          border-b border-amber-200/20 dark:border-gray-800/50
          ${scrolled 
            ? 'bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg py-2 sm:py-3' 
            : 'bg-white/70 dark:bg-gray-900/80 backdrop-blur-md py-3 sm:py-4'
          }
        `}
      >
        <div className="container mx-auto px-4 max-w-6xl flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="group relative flex items-center gap-2 shrink-0">
            <Image 
              src={logo} 
              alt="ATHAR Logo" 
              className="w-20 h-14 sm:w-24 sm:h-16 md:w-28 md:h-18 group-hover:scale-105 transition-transform object-contain" 
              priority
            />
          </Link>
 
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-white/60 dark:bg-gray-800/60 p-1.5 rounded-full border border-white/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
            {navItems.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
            <div className="w-px h-6 bg-amber-200/50 dark:bg-gray-700/50 mx-1"></div>
            <Link
              href="/add"
              className="flex items-center gap-2 px-5 py-2 rounded-full
                bg-gradient-to-r from-amber-600 to-amber-500
                text-white font-bold text-sm
                shadow-lg shadow-amber-500/30
                hover:shadow-amber-600/40 hover:-translate-y-0.5
                active:scale-95
                transition-all duration-200"
            >
              <PlusCircle size={16} />
              <span>إضافة كتاب</span>
            </Link>
          </nav>
 
          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-10 h-10 rounded-full bg-white/20 dark:bg-gray-800/20 animate-pulse"></div>
            ) : isAuthenticated ? (
              <Link 
                href="/profile"
                className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-amber-500/50 hover:border-amber-500 dark:border-amber-500/30 dark:hover:border-amber-500 focus:outline-none hover:ring-4 hover:ring-amber-500/25 dark:hover:ring-amber-500/15 transition-all duration-300 shadow-md overflow-hidden cursor-pointer shrink-0"
                title="الملف الشخصي"
              >
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user?.displayName || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-amber-100 dark:bg-gray-700 flex items-center justify-center">
                    <FontAwesomeIcon icon={faUser} className="text-amber-600 dark:text-amber-400 text-lg" />
                  </div>
                )}
              </Link>
            ) : (
              <Link 
                href="/login"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all"
              >
                <FontAwesomeIcon icon={faSignInAlt} />
                <span>تسجيل الدخول</span>
              </Link>
            )}
          </div>
 
        </div>
      </header>
 
      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl border-t border-amber-100/50 dark:border-gray-800/50 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] px-4 pb-safe-bottom animate-fade-in">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto">
          {/* Home Tab */}
          <Link 
            href="/" 
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 relative ${
              pathname === '/' ? 'text-amber-600 dark:text-amber-500 font-bold scale-105' : 'text-amber-900/50 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500'
            }`}
          >
            <Home size={22} className={`transition-transform duration-300 ${pathname === '/' ? '-translate-y-1' : ''}`} />
            <span className="text-[10px] mt-1 font-bold">الرئيسية</span>
            {pathname === '/' && (
              <span className="absolute bottom-1 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
            )}
          </Link>
 
          {/* Library Tab */}
          <Link 
            href="/library" 
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 relative ${
              pathname === '/library' ? 'text-amber-600 dark:text-amber-500 font-bold scale-105' : 'text-amber-900/50 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500'
            }`}
          >
            <Library size={22} className={`transition-transform duration-300 ${pathname === '/library' ? '-translate-y-1' : ''}`} />
            <span className="text-[10px] mt-1 font-bold">مكتبتي</span>
            {pathname === '/library' && (
              <span className="absolute bottom-1 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
            )}
          </Link>
 
          {/* Add Book Tab (Floating style) */}
          <div className="flex-1 flex justify-center h-full relative -translate-y-4">
            <Link 
              href="/add" 
              className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-full shadow-[0_8px_20px_rgba(217,119,6,0.4)] border-4 border-white dark:border-gray-900 transform active:scale-90 transition-all hover:scale-105"
              aria-label="إضافة كتاب"
            >
              <PlusCircle size={28} />
            </Link>
          </div>
 
          {/* Profile/Login Tab */}
          {isAuthenticated ? (
            <Link 
              href="/profile" 
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 relative ${
                pathname === '/profile' ? 'text-amber-600 dark:text-amber-500 font-bold scale-105' : 'text-amber-900/50 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500'
              }`}
            >
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className={`w-6 h-6 rounded-full border transition-all duration-300 ${
                    pathname === '/profile' ? 'border-amber-600 dark:border-amber-500 scale-105 -translate-y-1' : 'border-gray-300 dark:border-gray-700'
                  }`}
                />
              ) : (
                <User size={22} className={`transition-transform duration-300 ${pathname === '/profile' ? '-translate-y-1' : ''}`} />
              )}
              <span className="text-[10px] mt-1 font-bold">حسابي</span>
              {pathname === '/profile' && (
                <span className="absolute bottom-1 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
              )}
            </Link>
          ) : (
            <Link 
              href="/login" 
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 relative ${
                pathname === '/login' || pathname === '/register' ? 'text-amber-600 dark:text-amber-500 font-bold scale-105' : 'text-amber-900/50 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-500'
              }`}
            >
              <User size={22} className={`transition-transform duration-300 ${pathname === '/login' || pathname === '/register' ? '-translate-y-1' : ''}`} />
              <span className="text-[10px] mt-1 font-bold">دخول</span>
              {(pathname === '/login' || pathname === '/register') && (
                <span className="absolute bottom-1 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
              )}
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
 
/* Desktop Navigation Item */
function NavItem({ href, icon: Icon, label }) {
  return (
    <Link
      href={href}
      className="relative group flex items-center gap-2 px-4 py-2 rounded-full
        text-amber-900/70 dark:text-gray-300 font-medium text-sm
        hover:text-amber-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700
        transition-all duration-300"
    >
      <Icon 
        size={18} 
        className="group-hover:scale-110 transition-transform duration-300 text-amber-600/80 dark:text-amber-500 group-hover:text-amber-600 dark:group-hover:text-amber-400" 
      />
      <span>{label}</span>
      <span className="absolute bottom-1.5 right-1/2 translate-x-1/2 w-0 h-1 bg-amber-500 dark:bg-amber-400 rounded-full opacity-0 group-hover:w-1 group-hover:opacity-100 transition-all duration-300"></span>
    </Link>
  );
}

