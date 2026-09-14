import React from 'react';
import { X, Calendar, User, Tag, ShieldCheck, Share2 } from 'lucide-react';
import { NoticeItem } from '../types';

interface NoticeModalProps {
  notice: NoticeItem | null;
  onClose: () => void;
}

export const NoticeModal: React.FC<NoticeModalProps> = ({ notice, onClose }) => {
  if (!notice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#0A2540] text-white p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-cyan-300 px-2 py-0.5 rounded border border-blue-400/30">
                {notice.category}
              </span>
              <span className="text-xs text-blue-200/80 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {notice.date}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white leading-snug">
              {notice.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 text-xs font-medium text-blue-900 leading-relaxed">
            {notice.summary}
          </div>

          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {notice.fullContent}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Publicado por: <strong className="text-slate-700">{notice.author}</strong>
            </span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Comunicado Verificado
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition cursor-pointer"
          >
            Entendido / Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
