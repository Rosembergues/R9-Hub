import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Bell, 
  X, 
  Menu, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Info,
  Lock,
  SlidersHorizontal,
  LogOut,
  User,
  ShieldAlert
} from 'lucide-react';
import { NoticeItem } from '../types';
import { useHub } from '../context/HubContext';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  onSelectCategory?: (cat: string) => void;
  notices: NoticeItem[];
  onOpenNotice: (notice: NoticeItem) => void;
  onOpenAddLinkModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  activeSection,
  setActiveSection,
  onSelectCategory,
  notices,
  onOpenNotice,
  onOpenAddLinkModal,
}) => {
  const { isAuthenticated, openLoginModal, openAdminPanel, logout } = useHub();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut Ctrl+K or / to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close notifications and profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notices.filter(n => !readNotifications.includes(n.id)).length;

  const markAllAsRead = () => {
    setReadNotifications(notices.map(n => n.id));
  };

  const handleNavClick = (sectionId: string, categoryFilter?: string) => {
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);
    if (categoryFilter && onSelectCategory) {
      onSelectCategory(categoryFilter);
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0A2540] text-white border-b border-blue-900/60 shadow-md">
      {/* Main Corporate Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4 md:gap-8">
          
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); handleNavClick('topo'); }}
              className="flex items-center gap-3 group"
              id="header-brand-logo"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-2 ring-white/10 group-hover:scale-105 transition-transform duration-200">
                <span className="font-extrabold text-white text-lg tracking-tight">R9</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                    R9 <span className="text-cyan-400 font-bold">HUB</span>
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-500/25 text-blue-200 px-2 py-0.5 rounded border border-blue-400/30">
                    Intranet
                  </span>
                </div>
                <span className="text-[11px] text-blue-200/75 hidden sm:block">
                  Portal de Sistemas & Recursos da Equipe
                </span>
              </div>
            </a>
          </div>

          {/* Integrated Quick Search Bar */}
          <div className="flex-1 max-w-xl relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-blue-300 absolute left-3.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                id="intranet-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar sistemas, links, ferramentas ou comunicados... (Ctrl+K)"
                className="w-full bg-blue-950/60 text-white placeholder-blue-300/60 pl-10 pr-16 py-2.5 rounded-lg border border-blue-800/80 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm transition-all shadow-inner"
              />
              {searchQuery ? (
                <button
                  id="btn-clear-search"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 p-1 text-blue-300 hover:text-white rounded-md transition"
                  title="Limpar pesquisa"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <span className="hidden sm:flex items-center absolute right-3 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-800">
                  Ctrl K
                </span>
              )}
            </div>

            {/* Quick search badge indicator if typing */}
            {searchQuery && (
              <div className="absolute top-full mt-1.5 left-0 right-0 bg-[#071a2e] text-xs text-blue-200 py-1.5 px-3 rounded-lg border border-blue-800 shadow-xl flex items-center justify-between z-50">
                <span>Filtrando por: <strong className="text-white">"{searchQuery}"</strong></span>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-cyan-400 hover:underline cursor-pointer text-[11px]"
                >
                  Limpar filtro
                </button>
              </div>
            )}
          </div>

          {/* Desktop Right User & Notifications */}
          <div className="hidden lg:flex items-center space-x-3 shrink-0">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                id="btn-notifications"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2.5 rounded-lg bg-blue-950/70 border border-blue-800/70 text-blue-200 hover:text-white hover:bg-blue-900/60 transition cursor-pointer"
                title="Comunicados da Equipe"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="bg-[#0A2540] text-white p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-sm">Comunicados Recentes</span>
                      <span className="text-xs bg-blue-800 text-cyan-300 px-1.5 py-0.5 rounded font-mono">
                        {unreadCount} novos
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-200 hover:text-white underline cursor-pointer"
                      >
                        Marcar lidos
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notices.map((notice) => {
                      const isRead = readNotifications.includes(notice.id);
                      return (
                        <div
                          key={notice.id}
                          onClick={() => {
                            setReadNotifications(prev => [...prev, notice.id]);
                            onOpenNotice(notice);
                            setIsNotificationOpen(false);
                          }}
                          className={`p-3.5 hover:bg-slate-50 transition cursor-pointer flex flex-col gap-1 ${
                            !isRead ? 'bg-blue-50/60 border-l-4 border-l-blue-600' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                              {notice.category}
                            </span>
                            <span className="text-[11px] text-slate-400">{notice.date}</span>
                          </div>
                          <h4 className="font-semibold text-sm text-slate-800 leading-snug line-clamp-1">
                            {notice.title}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {notice.summary}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-2.5 bg-slate-50 text-center border-t border-slate-100">
                    <button
                      onClick={() => setIsNotificationOpen(false)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-800 transition cursor-pointer"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Admin Access */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2.5 pl-2.5 pr-2 py-1 rounded-xl border border-blue-800/80 hover:bg-blue-900/50 transition cursor-pointer text-left"
                title="Opções do Usuário e Administração"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs ring-2 ring-blue-400/40">
                    EQ
                  </div>
                  {isAuthenticated && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#0A2540]" title="Administrador Logado" />
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-white leading-tight flex items-center gap-1">
                    Equipe R9
                    <ChevronDown className={`w-3 h-3 text-blue-300 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                  </span>
                  <span className="text-[10px] text-blue-300">
                    {isAuthenticated ? 'Admin Ativo' : 'Colaborador'}
                  </span>
                </div>
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-800">
                    <p className="text-xs font-bold text-white">Equipe R9 Hub</p>
                    <p className="text-[11px] text-slate-400">Portal Corporativo Interno</p>
                    {isAuthenticated ? (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-semibold text-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Modo Administrador Ativo
                      </div>
                    ) : (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-medium text-slate-400">
                        Acesso Padrão de Leitura
                      </div>
                    )}
                  </div>

                  <div className="py-1">
                    {isAuthenticated ? (
                      <>
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            openAdminPanel();
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs text-white hover:bg-blue-600/30 flex items-center gap-2.5 transition cursor-pointer font-semibold"
                        >
                          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                          <span>Abrir Painel Admin</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-red-400" />
                          <span>Sair do Modo Admin</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          openLoginModal();
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-blue-300 hover:bg-blue-900/40 hover:text-white flex items-center gap-2.5 transition cursor-pointer font-semibold"
                      >
                        <Lock className="w-4 h-4 text-amber-400" />
                        <span>Área Administrativa (Login)</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 rounded-lg bg-blue-950 text-blue-200"
              title="Notificações"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-blue-950 text-blue-200 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center justify-between pt-3 mt-2 border-t border-blue-900/60 text-sm">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleNavClick('topo')}
              className={`px-3.5 py-1.5 rounded-md font-medium transition cursor-pointer ${
                activeSection === 'topo'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-100/90 hover:bg-blue-900/60 hover:text-white'
              }`}
            >
              Início
            </button>
            <button
              onClick={() => handleNavClick('acesso-rapido', 'r9_core')}
              className="px-3.5 py-1.5 rounded-md font-medium text-blue-100/90 hover:bg-blue-900/60 hover:text-white transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Sistemas R9
            </button>
            <button
              onClick={() => handleNavClick('acesso-rapido', 'all')}
              className="px-3.5 py-1.5 rounded-md font-medium text-blue-100/90 hover:bg-blue-900/60 hover:text-white transition cursor-pointer"
            >
              Todas as Ferramentas
            </button>
            <button
              onClick={() => handleNavClick('suporte')}
              className="px-3.5 py-1.5 rounded-md font-medium text-blue-100/90 hover:bg-blue-900/60 hover:text-white transition cursor-pointer"
            >
              Suporte & Atendimento
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs text-blue-300">
            <span className="bg-blue-900/60 px-2.5 py-1 rounded border border-blue-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Rede Corporativa Autenticada
            </span>
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden pt-3 pb-2 border-t border-blue-900/80 mt-3 space-y-1">
            <button
              onClick={() => handleNavClick('topo')}
              className="w-full text-left px-3 py-2 rounded text-sm text-white font-medium hover:bg-blue-900/60"
            >
              Início
            </button>
            <button
              onClick={() => handleNavClick('acesso-rapido', 'r9_core')}
              className="w-full text-left px-3 py-2 rounded text-sm text-blue-200 font-medium hover:bg-blue-900/60 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Sistemas Principais R9
            </button>
            <button
              onClick={() => handleNavClick('acesso-rapido', 'all')}
              className="w-full text-left px-3 py-2 rounded text-sm text-blue-200 font-medium hover:bg-blue-900/60"
            >
              Todas as Ferramentas & Links
            </button>
            <button
              onClick={() => handleNavClick('suporte')}
              className="w-full text-left px-3 py-2 rounded text-sm text-blue-200 font-medium hover:bg-blue-900/60"
            >
              Suporte & Atendimento
            </button>
            <div className="pt-2 border-t border-blue-900/50 mt-2 space-y-2">
              <button
                onClick={() => {
                  onOpenAddLinkModal();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-center px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm"
              >
                + Adicionar Atalho Personalizado
              </button>

              {isAuthenticated ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openAdminPanel();
                    }}
                    className="flex-1 text-center px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Painel Admin</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="px-3 py-2 rounded-lg bg-red-500/20 text-red-300 font-semibold text-xs flex items-center justify-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openLoginModal();
                  }}
                  className="w-full text-center px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Área Administrativa (Login)</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
