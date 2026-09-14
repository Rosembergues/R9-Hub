import React, { useState } from 'react';
import { 
  ExternalLink, 
  Star, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  Trash2,
  Share2
} from 'lucide-react';
import { SystemItem } from '../types';
import { DynamicIcon } from './DynamicIcon';

interface SystemCardProps {
  system: SystemItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onDeleteCustom?: (id: string) => void;
}

export const SystemCard: React.FC<SystemCardProps> = ({
  system,
  isFavorite,
  onToggleFavorite,
  onDeleteCustom,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(system.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(system.id);
  };

  // Determine icon background style based on category & primary status
  const getIconStyle = () => {
    if (system.isPrimary) {
      return 'bg-gradient-to-tr from-blue-700 to-cyan-500 text-white shadow-md shadow-blue-500/20';
    }
    switch (system.category) {
      case 'r9_core':
        return 'bg-blue-600 text-white';
      case 'communication_sales':
        return 'bg-indigo-600 text-white';
      case 'productivity':
        return 'bg-sky-600 text-white';
      case 'support_hr':
        return 'bg-slate-800 text-white';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  return (
    <div 
      className={`group relative bg-white rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
        system.isPrimary
          ? 'border-blue-200/90 shadow-sm hover:shadow-lg hover:border-blue-400 ring-1 ring-blue-100'
          : 'border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-md'
      }`}
      id={`system-card-${system.id}`}
    >
      {/* Top action row & status badge */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3.5">
          {/* Tile Icon Container */}
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${getIconStyle()}`}>
              <DynamicIcon name={system.icon} className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {system.badge && (
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    system.isPrimary
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {system.badge}
                  </span>
                )}
                {system.status === 'updated' && (
                  <span className="text-[10px] font-bold bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                    Novo
                  </span>
                )}
                {system.isCustom && (
                  <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">
                    Atalho Pessoal
                  </span>
                )}
              </div>

              <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors mt-0.5">
                {system.name}
              </h3>
            </div>
          </div>

          {/* Action buttons: Favorite & Copy */}
          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={handleFavoriteClick}
              className={`p-1.5 rounded-lg transition ${
                isFavorite 
                  ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              aria-label="Favoritar ferramenta"
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
            </button>

            <button
              onClick={handleCopyLink}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              title="Copiar endereço do sistema"
              aria-label="Copiar link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            {system.isCustom && onDeleteCustom && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDeleteCustom(system.id);
                }}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Excluir atalho personalizado"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* System Description */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
          {system.description}
        </p>
      </div>

      {/* Footer / Launch Link Button */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
        <span className="text-[11px] font-mono text-slate-400 truncate max-w-[170px] sm:max-w-[200px]">
          {system.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
        </span>

        <a
          href={system.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            system.isPrimary
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 group-hover:shadow-md'
              : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700'
          }`}
          id={`open-link-btn-${system.id}`}
        >
          <span>Acessar</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Copy Toast Feedback */}
      {copied && (
        <div className="absolute top-2 right-12 bg-slate-900 text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1 animate-in fade-in zoom-in-95 duration-100 z-10">
          <Check className="w-3 h-3 text-emerald-400" />
          <span>Link copiado!</span>
        </div>
      )}
    </div>
  );
};
