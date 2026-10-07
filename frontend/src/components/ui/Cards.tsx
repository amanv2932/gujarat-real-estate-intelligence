import React from 'react';
import type { LucideIcon } from 'lucide-react';

export function SectionCard({ children, title, description, className = '' }: { children: React.ReactNode; title?: string; description?: string; className?: string }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-lg shadow-sm ${className}`}>
      {(title || description) && (
        <div className="px-6 py-4 border-b border-slate-100">
          {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
          {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

export function StatCard({ title, icon: Icon, value, className = '' }: { title: string; icon?: LucideIcon; value?: string; className?: string }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        {Icon && <Icon className="h-5 w-5 text-slate-400" />}
      </div>
      <div className={`text-2xl font-bold mb-1 ${value ? 'text-slate-900' : 'text-slate-300'}`}>{value || '--'}</div>
      {!value && <p className="text-xs text-slate-400 italic">Data will appear here</p>}
    </div>
  );
}
