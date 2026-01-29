'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Navbar = ({ activeTab, setActiveTab }) => {
    const [isOpen, setIsOpen] = useState(false);
    const booksCount = useSelector((state) => state?.books?.items?.length || 0);
    const router = useRouter();

    useEffect(() => {
        const handleResize = () => window.innerWidth >= 768 && setIsOpen(false);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navLinks = [
        { id: 'home', name: 'الرئيسية', icon: 'fas fa-home', href: '/' },
        { id: 'add', name: 'إضافة كتاب', icon: 'fas fa-plus-circle', href: '/add' },
        { id: 'library', name: 'مكتبتي', icon: 'fas fa-book-reader', href: '/library' },
    ];

    const handleLinkClick = (id, href) => {
        setActiveTab(id);
        setIsOpen(false);
        if (href) router.push(href);
    };

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm font-sans transition-all duration-300" dir="rtl" aria-label="القائمة الرئيسية">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
            <div className="shrink-0 flex items-center gap-3 cursor-pointer group" onClick={() => handleLinkClick('home', '/')} role="button" tabIndex={0}>
                <div className="bg-linear-to-tr from-indigo-600 to-purple-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-feather-alt text-xl" aria-hidden="true"></i>
                </div>
                <span className="text-3xl font-bold text-gray-800 font-serif tracking-wide">أثــر</span>
            </div>

            <div className="hidden md:flex items-center gap-2 flex-row-reverse">
                {navLinks.map((link) => (
                <button
                    key={link.id}
                    onClick={() => handleLinkClick(link.id, link.href)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 relative overflow-hidden ${
                    activeTab === link.id 
                    ? 'text-indigo-600 bg-indigo-50/80 shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-indigo-500'
                    }`}
                    aria-current={activeTab === link.id ? 'page' : undefined}
                >
                    <i className={`${link.icon} ${activeTab === link.id ? 'animate-bounce' : ''}`} aria-hidden="true"></i>
                    {link.name}
                    {link.id === 'library' && (
                    <span className="mr-1 bg-indigo-100 text-indigo-600 text-[10px] px-1.5 py-0.5 rounded-full" aria-hidden="true">{booksCount}</span>
                    )}
                </button>
                ))}
            </div>

            <div className="md:hidden">
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-600 hover:text-indigo-600 transition-colors" aria-expanded={isOpen} aria-label="قائمة التنقل">
                <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars-staggered'} text-2xl`}></i>
                </button>
            </div>
            </div>
        </div>
        
        {/* Mobile Menu */}
        <div className={`md:hidden absolute w-full bg-white border-b border-gray-100 transition-[max-height,opacity] duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none overflow-hidden'}`}>
            <div className="p-4 space-y-2">
            {navLinks.map((link) => (
                <button
                    key={link.id}
                    onClick={() => handleLinkClick(link.id, link.href)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === link.id ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                    <i className={`${link.icon} w-6 text-center`} aria-hidden="true"></i>
                    <span>{link.name}</span>
                    {link.id === 'library' && <span className="mr-2 bg-indigo-100 text-indigo-600 text-[10px] px-1.5 py-0.5 rounded-full">{booksCount}</span>}
                </button>
            ))}
            </div>
        </div>
        </nav>
    );
};

export default Navbar;