import React from 'react';
import { 
  Sparkles, 
  Star, 
  Grid, 
  Plus, 
  Search, 
  Layers, 
  MessageSquare, 
  Briefcase, 
  LifeBuoy,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { SystemCategory, SystemItem } from '../types';
import { SystemCard } from './SystemCard';

interface QuickAccessGridProps {
  systems: SystemItem[];
  selectedCategory: SystemCategory;
  setSelectedCategory: (cat: SystemCategory) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAddModal: () => void;
  onDeleteCustom?: (id: string) => void;
}

export const QuickAccessGrid: React.FC<QuickAccessGridProps> = ({
  systems,
  selectedCategory,
  setSelectedCategory,
  favorites,
  onToggleFavorite,
  searchQuery,
  setSearchQuery,
  onOpenAddModal,
  onDeleteCustom,
}) => {
  // Filter systems based on category and search query
  const filteredSystems = systems.filter((sys) => {
    // 1. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = sys.name.toLowerCase().includes(q);
      const matchDesc = sys.description.toLowerCase().includes(q);
      const matchUrl = sys.url.toLowerCase().includes(q);
      const matchTags = sys.tags.some(t => t.toLowerCase().includes(q));
      const matchBadge = sys.badge?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchUrl && !matchTags && !matchBadge) {
        return false;
      }
    }

    // 2. Category filter
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'favorites') return favorites.includes(sys.id);
    if (selectedCategory === 'r9_core') return sys.category === 'r9_core' || sys.isPrimary;
    return sys.category === selectedCategory;
  });

  const categoriesConfig: { id: SystemCategory; label: string; icon: React.ReactNode; count: number }[] = [
    { 
      id: 'all', 
      label: 'Todos', 
      icon: <Grid className="w-4 h-4" />, 
      count: systems.length 
    },
    { 
      id: 'favorites', 
      label: 'Meus Favoritos', 
      icon: <Star className="w-4 h-4 text-amber-500 fill-amber-500" />, 
      count: systems.filter(s => favorites.includes(s.id)).length 
    },
    { 
      id: 'r9_core', 
      label: 'Sistemas R9', 
      icon: <Sparkles className="w-4 h-4 text-blue-600" />, 
      count: systems.filter(s => s.category === 'r9_core' || s.isPrimary).length 
    },
    { 
      id: 'communication_sales', 
      label: 'Comunicação & Vendas', 
      icon: <MessageSquare className="w-4 h-4 text-indigo-600" />, 
      count: systems.filter(s => s.category === 'communication_sales').length 
    },
    { 
      id: 'productivity', 
      label: 'Produtividade & Gestão', 
      icon: <Briefcase className="w-4 h-4 text-sky-600" />, 
      count: systems.filter(s => s.category === 'productivity').length 
    },
    { 
      id: 'support_hr', 
      label: 'Suporte & RH', 
      icon: <LifeBuoy className="w-4 h-4 text-slate-700" />, 
      count: systems.filter(s => s.category === 'support_hr').length 
    }
  ];

  return (
    <section id="acesso-rapido" className="scroll-mt-24 space-y-5">
      {/* Section Header with Category Tabs and Add Link button */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-sm">
                <Grid className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Acesso Rápido aos Sistemas
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Painel centralizado de links diretos, ferramentas de disparo, planejamento e operação da equipe R9.
            </p>
          </div>

          {/* Action to add custom personal shortcut */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm hover:shadow"
              id="btn-open-add-custom-link"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Atalho</span>
            </button>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-1 no-scrollbar">
          {categoriesConfig.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/70'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200/70 text-slate-600'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Counter and Active Search Feedback */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Exibindo <strong className="text-slate-800 font-semibold">{filteredSystems.length}</strong> de {systems.length} ferramentas e sistemas
        </span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <XCircle className="w-3.5 h-3.5" />
            Limpar busca
          </button>
        )}
      </div>

      {/* The Tiles Grid */}
      {filteredSystems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSystems.map((system) => (
            <SystemCard
              key={system.id}
              system={system}
              isFavorite={favorites.includes(system.id)}
              onToggleFavorite={onToggleFavorite}
              onDeleteCustom={onDeleteCustom}
            />
          ))}
        </div>
      ) : (
        /* Empty Search / Filter State */
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <Search className="w-7 h-7 text-blue-500" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Nenhum sistema ou link encontrado
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
            Não encontramos resultados para sua pesquisa ou filtro selecionado. Tente pesquisar por termos como "Mailer", "Planner", "Sales" ou "IA".
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
            >
              Exibir todos os sistemas
            </button>
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
            >
              + Adicionar como atalho
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
