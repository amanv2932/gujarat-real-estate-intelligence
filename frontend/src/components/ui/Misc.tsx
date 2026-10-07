import React from 'react';

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
}

export function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' }) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 last:mb-0">
      <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">{title}</h4>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

export function ChartContainer({ title, height = 300 }: { title: string; height?: number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 w-full">
      <h3 className="text-sm font-medium text-slate-700 mb-4">{title}</h3>
      <div 
        className="w-full flex items-center justify-center bg-slate-50 border border-slate-100 rounded-md" 
        style={{ height: `${height}px` }}
      >
        <span className="text-sm text-slate-400 italic">Chart data will appear here</span>
      </div>
    </div>
  );
}

export function DataTablePlaceholder({ columns = 4, rows = 5 }: { columns?: number; rows?: number }) {
  return (
    <div className="w-full overflow-hidden border border-slate-200 rounded-lg">
      <table className="w-full text-left text-sm text-slate-500">
        <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-6 py-3 font-medium">Column {i + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
