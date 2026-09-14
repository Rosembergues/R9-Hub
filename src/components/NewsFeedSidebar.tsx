import React from 'react';
import { 
  Bell, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { NoticeItem } from '../types';

interface NewsFeedSidebarProps {
  notices: NoticeItem[];
  onOpenNotice: (notice: NoticeItem) => void;
}

export const NewsFeedSidebar: React.FC<NewsFeedSidebarProps> = ({
  notices,
  onOpenNotice,
}) => {
  return (
    <aside className="h-full flex flex-col">
      {/* Recent Updates / News Feed Widget */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight">
              Atualizações Recentes
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
            {notices.length} avisos
          </span>
        </div>

        {/* Scrollable list constrained strictly to the carousel's height */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2 divide-y divide-slate-100">
          {notices.map((notice) => {
            const isHigh = notice.priority === 'alta';
            return (
              <div
                key={notice.id}
                onClick={() => onOpenNotice(notice)}
                className="group pt-2 first:pt-0 p-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    isHigh
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {notice.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {notice.date}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition leading-snug mb-0.5 line-clamp-1">
                  {notice.title}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-1 leading-relaxed">
                  {notice.summary}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="pt-2.5 border-t border-slate-100 text-center shrink-0 mt-2">
          <span className="text-[11px] text-slate-400">
            Clique em qualquer informe para ler o comunicado.
          </span>
        </div>

      </div>
    </aside>
  );
};
