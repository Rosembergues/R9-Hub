import React, { useState } from 'react';
import { Header } from './components/Header';
import { HeroCarousel } from './components/HeroCarousel';
import { NewsFeedSidebar } from './components/NewsFeedSidebar';
import { QuickAccessGrid } from './components/QuickAccessGrid';
import { Footer } from './components/Footer';
import { NoticeModal } from './components/NoticeModal';
import { AddCustomLinkModal } from './components/AddCustomLinkModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';
import { HubProvider, useHub } from './context/HubContext';
import { NoticeItem, SystemCategory } from './types';
import { 
  SlidersHorizontal, 
  Plus, 
  Star, 
  Cloud, 
  Loader2, 
  Database, 
  Sparkles,
  CheckCircle2 
} from 'lucide-react';

function HubPortal() {
  const { 
    systems, 
    notices, 
    slides, 
    favorites, 
    toggleFavorite, 
    addSystem, 
    deleteSystem,
    openAdminPanel,
    isAuthenticated,
    userEmail,
    isLoading,
    isSyncing,
    isDbEmpty,
    seedInitialData
  } = useHub();

  // Search & Navigation state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SystemCategory>('all');
  const [activeSection, setActiveSection] = useState('topo');

  // Modals state
  const [activeNoticeModal, setActiveNoticeModal] = useState<NoticeItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const handleSelectCategoryFromNav = (category: string) => {
    setSelectedCategory(category as SystemCategory);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800" id="topo">
      {/* Top subtle cloud sync banner */}
      {(isLoading || isSyncing) && (
        <div className="w-full bg-blue-600 text-white py-1.5 px-4 text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition-all duration-300">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>{isLoading ? 'Conectando e sincronizando dados com o Supabase...' : 'Gravando alterações no Supabase...'}</span>
        </div>
      )}

      {/* Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onSelectCategory={handleSelectCategoryFromNav}
        notices={notices}
        onOpenNotice={(notice) => setActiveNoticeModal(notice)}
        onOpenAddLinkModal={() => setIsAddModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Supabase Empty Database Seed Callout (Discreet banner) */}
        {isDbEmpty && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="font-semibold text-blue-950">Banco Supabase Conectado (Tabelas Vazias): </span>
                <span className="text-blue-800">Deseja semear as tabelas com os sistemas, comunicados e banners corporativos iniciais?</span>
              </div>
            </div>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {seedMessage && (
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md">
                    {seedMessage}
                  </span>
                )}
                <button
                  onClick={async () => {
                    const res = await seedInitialData();
                    if (res.success) {
                      setSeedMessage('Dados semeados com sucesso!');
                      setTimeout(() => setSeedMessage(null), 4000);
                    } else {
                      setSeedMessage(res.error || 'Erro ao semear dados');
                      setTimeout(() => setSeedMessage(null), 4000);
                    }
                  }}
                  disabled={isSyncing}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-1.5 shrink-0 transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Popular Dados no Supabase</span>
                </button>
              </div>
            ) : (
              <button
                onClick={openAdminPanel}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-1.5 shrink-0 transition cursor-pointer"
              >
                <span>Acessar Painel Admin</span>
              </button>
            )}
          </div>
        )}

        {/* Welcome Greeting & Institutional Sub-banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Olá, <span className="text-blue-600">Equipe R9</span>! 👋
              </h1>
              {isAuthenticated ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Admin Ativo {userEmail && <span className="text-emerald-700 font-mono text-[10px]">({userEmail})</span>}
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Supabase Nuvem
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Bem-vindo ao seu portal integrado. Acesse suas ferramentas diárias, métricas e comunicados oficiais.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedCategory('favorites');
                const el = document.getElementById('acesso-rapido');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Meus Favoritos ({favorites.length})</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Atalho Rápido</span>
            </button>
            {isAuthenticated && (
              <button
                onClick={openAdminPanel}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                title="Abrir Painel Administrativo"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Painel Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Hero Section: Main Carousel (Left) + Side Feed & Shortcuts (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Carousel (approx 68% width on desktop) */}
          <div className="lg:col-span-8 flex flex-col">
            <HeroCarousel slides={slides} />
          </div>

          {/* Right Column: News & Updates Feed (approx 32% width on desktop) */}
          <div className="lg:col-span-4 flex flex-col">
            <NewsFeedSidebar
              notices={notices}
              onOpenNotice={(notice) => setActiveNoticeModal(notice)}
            />
          </div>
        </div>

        {/* Section: Acesso Rápido (Tile Grid of Cards) */}
        <QuickAccessGrid
          systems={systems}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onDeleteCustom={deleteSystem}
        />

      </main>

      {/* Footer */}
      <Footer />

      {/* Notice Detail Modal */}
      <NoticeModal
        notice={activeNoticeModal}
        onClose={() => setActiveNoticeModal(null)}
      />

      {/* Add Custom Shortcut Modal */}
      <AddCustomLinkModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSystem={addSystem}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal />

      {/* Full Admin Management Panel */}
      <AdminPanel />
    </div>
  );
}

export default function App() {
  return (
    <HubProvider>
      <HubPortal />
    </HubProvider>
  );
}
