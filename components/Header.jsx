'use client';
import React, { useState, useEffect } from 'react';
import { Home, Library, PlusCircle, BookOpen } from 'lucide-react';
import logo from '../public/image.png';
// محاكاة لمكون Link الخاص بـ Next.js ليعمل العرض هنا
// في مشروعك الحقيقي، استخدم: import Link from 'next/link';
const Link = ({ href, children, className }) => (
  <a href={href} className={className}>
    {children}
  </a>
);

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  // تأثير عند التمرير لتغيير شفافية الخلفية
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="  relative ">
      
      {/* بداية الناف بار */}
      <header 
        className={`
          fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-in-out
          border-b border-amber-200/20 
          ${scrolled 
            ? 'bg-white/80 backdrop-blur-xl shadow-lg py-2' 
            : 'bg-white/50 backdrop-blur-md py-4'
          }
        `}
      >
        <div className="container mx-auto px-4 max-w-6xl flex items-center justify-between">
          
          {/* الشعار - Logo */}
          <Link href="/" className="group relative flex items-center gap-2">
              {/* استبدل هذا الأيقونة بصورة اللوجو الخاصة بك */}
              {/* <img src={logo.src} ... /> */}
          <img src={logo.src} alt="شعار أثر" className="w-26 h-16" />
          </Link>

          <nav className="flex items-center gap-1 bg-white/40 p-1.5 rounded-full border border-white/50 shadow-sm backdrop-blur-sm">
            
            <NavItem href="/" icon={Home} label="الرئيسية" />
            <NavItem href="/library" icon={Library} label="مكتبتي" />
            
            {/* زر الإضافة مميز */}
            <div className="w-px h-6 bg-amber-200/50 mx-1"></div>
            
            <Link
              href="/add"
              className="
                flex items-center gap-2 px-5 py-2 rounded-full
                bg-gradient-to-r from-amber-600 to-amber-500
                text-white font-bold text-sm
                shadow-lg shadow-amber-500/30
                hover:shadow-amber-600/40 hover:-translate-y-0.5
                active:scale-95
                transition-all duration-200
              "
            >
              <PlusCircle size={16} />
              <span>إضافة كتاب</span>
            </Link>

          </nav>
        </div>
      </header>
      {/* نهاية الناف بار */}

      {/* محتوى وهمي للتجربة */}

    </div>
  );
}

/* عنصر تنقّل قابل لإعادة الاستخدام - مُحسن */
function NavItem({ href, icon: Icon, label }) {
  return (
    <Link
      href={href}
      className="
        relative group flex items-center gap-2 px-4 py-2 rounded-full
        text-amber-900/70 font-medium text-sm
        hover:text-amber-900 hover:bg-white
        transition-all duration-300
      "
    >
      <Icon 
        size={18} 
        className="group-hover:scale-110 transition-transform duration-300 text-amber-600/80 group-hover:text-amber-600" 
      />
      <span>{label}</span>
      
      {/* تأثير النقطة السفلية عند الهوفر */}
      <span className="absolute bottom-1.5 right-1/2 translate-x-1/2 w-0 h-1 bg-amber-500 rounded-full opacity-0 group-hover:w-1 group-hover:opacity-100 transition-all duration-300"></span>
    </Link>
  );
}