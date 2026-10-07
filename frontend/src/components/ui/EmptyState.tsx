import type { LucideIcon } from 'lucide-react';

export function EmptyState({ icon: Icon, title, description, className = '' }: { icon: LucideIcon; title: string; description: string; className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50 ${className}`}>
      <Icon className="h-12 w-12 text-slate-300 mb-4" strokeWidth={1.5} />
      <h3 className="text-lg font-medium text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm">{description}</p>
    </div>
  );
}
