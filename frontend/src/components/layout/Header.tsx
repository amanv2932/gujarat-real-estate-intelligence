import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();
  
  // Format the path for breadcrumbs
  const path = location.pathname.split('/')[1] || 'dashboard';
  const pageTitle = path.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-40 sticky top-0">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="md:hidden mr-4 text-slate-500 hover:text-slate-700 focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="hidden sm:flex flex-col">
          <span className="text-xs text-slate-500 font-medium">Pages / {pageTitle}</span>
          <h2 className="text-lg font-semibold text-slate-900 leading-none mt-1">{pageTitle}</h2>
        </div>
      </div>
    </header>
  );
}
