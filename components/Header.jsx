import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faHouse,
  faLayerGroup,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-amber-100/90 backdrop-blur border-b border-amber-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
        
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 text-2xl font-bold text-amber-900 hover:text-amber-700 transition"
        >
          <FontAwesomeIcon icon={faBook} className="text-amber-700" />
          <span>أثَر</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          
          <NavItem href="/" icon={faHouse} label="الرئيسية" />
          <NavItem href="/library" icon={faLayerGroup} label="مكتبتي" />
          <NavItem href="/add" icon={faPlus} label="إضافة كتاب" />

        </nav>
      </div>
    </header>
  );
}

/* عنصر تنقّل قابل لإعادة الاستخدام */
function NavItem({ href, icon, label }) {
  return (
    <Link
      href={href}
      className="
        flex items-center gap-2 px-3 py-2 rounded-lg
        text-amber-800
        hover:bg-amber-200 hover:text-amber-900
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-amber-400
      "
    >
      <FontAwesomeIcon icon={icon} className="text-xs opacity-80" />
      <span>{label}</span>
    </Link>
  );
}
