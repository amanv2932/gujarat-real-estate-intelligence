import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Calculator, BarChart3, Info } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  const navGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'PROPERTY INTELLIGENCE',
      items: [
        { name: 'Property Analyzer', path: '/property-analyzer', icon: Building2 },
        { name: 'Valuation', path: '/valuation', icon: Calculator },
        { name: 'Market Intelligence', path: '/market-intelligence', icon: BarChart3 },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'About', path: '/about', icon: Info },
      ],
    },
  ];

  return (
    <aside className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-[280px] flex-shrink-0 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out flex flex-col h-screen`}>
      <div className="flex-shrink-0 p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white leading-tight">Gujarat Real Estate</h1>
        <p className="text-blue-400 text-xs mt-1 font-medium tracking-wide">INTELLIGENCE PLATFORM</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {navGroups.map((group, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {group.title}
            </h3>
            <ul>
              {group.items.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className={`flex items-center px-6 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-blue-600/10 text-blue-400 border-r-2 border-blue-500' : 'hover:bg-slate-800 hover:text-white'}`}
                    >
                      <item.icon className={`mr-3 h-4 w-4 ${isActive ? 'text-blue-500' : 'text-slate-400'}`} />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/50 z-[-1]"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </aside>
  );
}
