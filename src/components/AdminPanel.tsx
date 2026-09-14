import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  ExternalLink, 
  RotateCcw, 
  LogOut, 
  ArrowLeft,
  LayoutGrid, 
  Bell, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  ShieldCheck,
  Tag,
  Star,
  Globe,
  Sliders,
  Calendar,
  UserCheck,
  RefreshCw,
  Database,
  Loader2,
  CloudUpload
} from 'lucide-react';
import { useHub } from '../context/HubContext';
import { supabase } from '../lib/supabase';
import { SystemItem, NoticeItem, CarouselSlide, SystemCategory } from '../types';
import { DynamicIcon } from './DynamicIcon';

const POPULAR_ICONS = [
  'Mail', 'CalendarCheck', 'TrendingUp', 'Bot', 'Headphones', 'BookOpen', 
  'Calendar', 'Users', 'FolderArchive', 'PieChart', 'FileText', 'MessageSquare',
  'Shield', 'Database', 'Cloud', 'Code', 'Layers', 'Briefcase', 'Send', 'Terminal'
];

export const AdminPanel: React.FC = () => {
  const { 
    isAdminPanelOpen, 
    closeAdminPanel, 
    logout,
    userEmail,
    isSyncing,
    isDbEmpty,
    dbError,
    refreshData,
    seedInitialData,
    systems, 
    notices, 
    slides,
    addSystem, 
    updateSystem, 
    deleteSystem,
    addNotice, 
    updateNotice, 
    deleteNotice,
    addSlide, 
    updateSlide, 
    deleteSlide,
    resetToDefaults
  } = useHub();

  const [activeTab, setActiveTab] = useState<'systems' | 'notices' | 'slides'>('systems');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // System Modal State
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);
  const [editingSystem, setEditingSystem] = useState<SystemItem | null>(null);
  const [systemForm, setSystemForm] = useState({
    name: '',
    url: '',
    description: '',
    category: 'r9_core' as SystemItem['category'],
    icon: 'Layers',
    badge: '',
    status: 'online' as NonNullable<SystemItem['status']>,
    isPrimary: false,
    tagsInput: ''
  });
  const [systemFormErrors, setSystemFormErrors] = useState<Record<string, string>>({});

  // Notice Modal State
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    summary: '',
    fullContent: '',
    category: 'Comunicado' as NoticeItem['category'],
    priority: 'normal' as NonNullable<NoticeItem['priority']>,
    date: '',
    author: ''
  });
  const [noticeFormErrors, setNoticeFormErrors] = useState<Record<string, string>>({});

  // Slide Modal State
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
  const [slideForm, setSlideForm] = useState({
    badge: '',
    title: '',
    subtitle: '',
    description: '',
    primaryActionText: 'Acessar Ferramenta',
    primaryActionUrl: '',
    gradient: 'linear-gradient(135deg, #0A2540 0%, #0052CC 100%)',
    icon: 'Bot'
  });
  const [slideFormErrors, setSlideFormErrors] = useState<Record<string, string>>({});

  // Reset confirmation state
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Item deletion confirmation modal state
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'system' | 'notice' | 'slide';
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemDeleteError, setItemDeleteError] = useState<string | null>(null);

  // Seed confirmation modal
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);

  // Feedback notification toast
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!feedbackMessage) return;
    const timer = setTimeout(() => {
      setFeedbackMessage(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [feedbackMessage]);

  if (!isAdminPanelOpen) return null;

  // --- SYSTEM ACTIONS ---
  const handleOpenSystemModal = (system?: SystemItem) => {
    if (system) {
      setEditingSystem(system);
      setSystemForm({
        name: system.name,
        url: system.url,
        description: system.description,
        category: system.category,
        icon: system.icon || 'Layers',
        badge: system.badge || '',
        status: system.status || 'online',
        isPrimary: !!system.isPrimary,
        tagsInput: system.tags ? system.tags.join(', ') : ''
      });
    } else {
      setEditingSystem(null);
      setSystemForm({
        name: '',
        url: '',
        description: '',
        category: 'r9_core',
        icon: 'Layers',
        badge: '',
        status: 'online',
        isPrimary: false,
        tagsInput: ''
      });
    }
    setSystemFormErrors({});
    setIsSystemModalOpen(true);
  };

  const handleSaveSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!systemForm.name.trim()) errors.name = 'O nome do sistema é obrigatório.';
    if (!systemForm.url.trim()) {
      errors.url = 'A URL é obrigatória.';
    } else if (!/^https?:\/\//i.test(systemForm.url.trim()) && !systemForm.url.startsWith('#')) {
      errors.url = 'A URL deve iniciar com http:// ou https://';
    }
    if (!systemForm.description.trim()) errors.description = 'A descrição é obrigatória.';

    if (Object.keys(errors).length > 0) {
      setSystemFormErrors(errors);
      return;
    }

    const tagsArray = systemForm.tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    let res;
    if (editingSystem) {
      res = await updateSystem(editingSystem.id, {
        name: systemForm.name.trim(),
        url: systemForm.url.trim(),
        description: systemForm.description.trim(),
        category: systemForm.category,
        icon: systemForm.icon,
        badge: systemForm.badge.trim() || undefined,
        status: systemForm.status,
        isPrimary: systemForm.isPrimary,
        tags: tagsArray
      });
    } else {
      res = await addSystem({
        name: systemForm.name.trim(),
        url: systemForm.url.trim(),
        description: systemForm.description.trim(),
        category: systemForm.category,
        icon: systemForm.icon,
        badge: systemForm.badge.trim() || undefined,
        status: systemForm.status,
        isPrimary: systemForm.isPrimary,
        tags: tagsArray,
        isCustom: true
      });
    }

    if (res && !res.success) {
      setSystemFormErrors({ submit: res.error || 'Erro ao salvar no Supabase' });
      return;
    }

    setIsSystemModalOpen(false);
  };

  const handleDeleteSystem = (id: string, name: string) => {
    setItemToDelete({
      type: 'system',
      id,
      name
    });
    setItemDeleteError(null);
  };

  // --- NOTICE ACTIONS ---
  const handleOpenNoticeModal = (notice?: NoticeItem) => {
    if (notice) {
      setEditingNotice(notice);
      setNoticeForm({
        title: notice.title,
        summary: notice.summary,
        fullContent: notice.fullContent || notice.summary,
        category: notice.category,
        priority: notice.priority || 'normal',
        date: notice.date,
        author: notice.author || 'Equipe R9'
      });
    } else {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const defaultDate = `Hoje, ${timeStr}`;

      setEditingNotice(null);
      setNoticeForm({
        title: '',
        summary: '',
        fullContent: '',
        category: 'Comunicado',
        priority: 'normal',
        date: defaultDate,
        author: 'Equipe R9'
      });
    }
    setNoticeFormErrors({});
    setIsNoticeModalOpen(true);
  };

  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!noticeForm.title.trim()) errors.title = 'O título do comunicado é obrigatório.';
    if (!noticeForm.summary.trim()) errors.summary = 'O resumo do comunicado é obrigatório.';
    if (!noticeForm.date.trim()) errors.date = 'A data de publicação é obrigatória.';

    if (Object.keys(errors).length > 0) {
      setNoticeFormErrors(errors);
      return;
    }

    let res;
    if (editingNotice) {
      res = await updateNotice(editingNotice.id, {
        title: noticeForm.title.trim(),
        summary: noticeForm.summary.trim(),
        fullContent: noticeForm.fullContent.trim() || noticeForm.summary.trim(),
        category: noticeForm.category,
        priority: noticeForm.priority,
        date: noticeForm.date.trim(),
        author: noticeForm.author.trim() || 'Equipe R9'
      });
    } else {
      res = await addNotice({
        title: noticeForm.title.trim(),
        summary: noticeForm.summary.trim(),
        fullContent: noticeForm.fullContent.trim() || noticeForm.summary.trim(),
        category: noticeForm.category,
        priority: noticeForm.priority,
        date: noticeForm.date.trim(),
        author: noticeForm.author.trim() || 'Equipe R9'
      });
    }

    if (res && !res.success) {
      setNoticeFormErrors({ submit: res.error || 'Erro ao salvar comunicado no Supabase' });
      return;
    }

    setIsNoticeModalOpen(false);
  };

  const handleDeleteNotice = (id: string, title: string) => {
    setItemToDelete({
      type: 'notice',
      id,
      name: title
    });
    setItemDeleteError(null);
  };

  // --- SLIDE ACTIONS ---
  const handleOpenSlideModal = (slide?: CarouselSlide) => {
    if (slide) {
      setEditingSlide(slide);
      setSlideForm({
        badge: slide.badge,
        title: slide.title,
        subtitle: slide.subtitle,
        description: slide.description,
        primaryActionText: slide.primaryActionText,
        primaryActionUrl: slide.primaryActionUrl || '',
        gradient: slide.gradient,
        icon: slide.icon || 'Bot'
      });
    } else {
      setEditingSlide(null);
      setSlideForm({
        badge: 'Destaque Corporativo',
        title: '',
        subtitle: '',
        description: '',
        primaryActionText: 'Acessar',
        primaryActionUrl: '',
        gradient: 'linear-gradient(135deg, #0A2540 0%, #0052CC 100%)',
        icon: 'Sparkles'
      });
    }
    setSlideFormErrors({});
    setIsSlideModalOpen(true);
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!slideForm.title.trim()) errors.title = 'O título do slide é obrigatório.';
    if (!slideForm.description.trim()) errors.description = 'A descrição do slide é obrigatória.';

    if (Object.keys(errors).length > 0) {
      setSlideFormErrors(errors);
      return;
    }

    let res;
    if (editingSlide) {
      res = await updateSlide(editingSlide.id, {
        badge: slideForm.badge.trim() || 'Destaque',
        title: slideForm.title.trim(),
        subtitle: slideForm.subtitle.trim(),
        description: slideForm.description.trim(),
        primaryActionText: slideForm.primaryActionText.trim() || 'Acessar',
        primaryActionUrl: slideForm.primaryActionUrl.trim() || undefined,
        gradient: slideForm.gradient,
        icon: slideForm.icon,
        isExternal: true
      });
    } else {
      res = await addSlide({
        badge: slideForm.badge.trim() || 'Destaque',
        title: slideForm.title.trim(),
        subtitle: slideForm.subtitle.trim(),
        description: slideForm.description.trim(),
        primaryActionText: slideForm.primaryActionText.trim() || 'Acessar',
        primaryActionUrl: slideForm.primaryActionUrl.trim() || undefined,
        gradient: slideForm.gradient,
        icon: slideForm.icon,
        themeColor: 'from-blue-900 via-blue-800 to-indigo-950',
        isExternal: true
      });
    }

    if (res && !res.success) {
      setSlideFormErrors({ submit: res.error || 'Erro ao salvar banner no Supabase' });
      return;
    }

    setIsSlideModalOpen(false);
  };

  const handleDeleteSlide = (id: string, title: string) => {
    if (slides.length <= 1) {
      setFeedbackMessage({
        type: 'error',
        text: 'É necessário manter ao menos um banner ativo no carrossel.'
      });
      return;
    }
    setItemToDelete({
      type: 'slide',
      id,
      name: title
    });
    setItemDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    setItemDeleteError(null);

    const { type, id, name } = itemToDelete;

    try {
      if (type === 'system') {
        // Dispara a exclusão real no Supabase
        const { error } = await supabase.from('hub_systems').delete().eq('id', id);
        if (error) {
          throw new Error(error.message || 'Erro ao excluir sistema no Supabase');
        }

        // Remove o item do estado da lista local para atualização imediata da interface
        await deleteSystem(id);

        console.log(`[Admin] Sistema "${name}" (${id}) removido com sucesso.`);
        setFeedbackMessage({
          type: 'success',
          text: `Sistema "${name}" removido com sucesso do Supabase!`
        });
      } else if (type === 'notice') {
        const { error } = await supabase.from('hub_announcements').delete().eq('id', id);
        if (error) {
          throw new Error(error.message || 'Erro ao excluir comunicado no Supabase');
        }
        await deleteNotice(id);
        console.log(`[Admin] Aviso "${name}" (${id}) removido com sucesso.`);
        setFeedbackMessage({
          type: 'success',
          text: `Aviso "${name}" removido com sucesso do Supabase!`
        });
      } else if (type === 'slide') {
        const { error } = await supabase.from('hub_banners').delete().eq('id', id);
        if (error) {
          throw new Error(error.message || 'Erro ao excluir banner no Supabase');
        }
        await deleteSlide(id);
        console.log(`[Admin] Banner "${name}" (${id}) removido com sucesso.`);
        setFeedbackMessage({
          type: 'success',
          text: `Banner "${name}" removido com sucesso do Supabase!`
        });
      }

      setItemToDelete(null);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Falha ao excluir item.';
      console.error('[Admin] Erro na exclusão do item:', err);
      setItemDeleteError(errorMsg);
      setFeedbackMessage({
        type: 'error',
        text: `Erro ao excluir: ${errorMsg}`
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExecuteSeed = async () => {
    setShowSeedConfirm(false);
    const res = await seedInitialData();
    if (res.success) {
      setFeedbackMessage({
        type: 'success',
        text: 'Dados iniciais inseridos com sucesso no Supabase!'
      });
    } else {
      setFeedbackMessage({
        type: 'error',
        text: res.error || 'Erro ao semear dados no Supabase.'
      });
    }
  };

  // Filtered systems in table
  const filteredSystems = systems.filter(sys => {
    const matchesSearch = 
      sys.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sys.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sys.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sys.badge && sys.badge.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = 
      selectedCategoryFilter === 'all' || sys.category === selectedCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  const categoryLabels: Record<string, string> = {
    r9_core: 'Sistemas Core R9',
    communication_sales: 'Comunicação & Vendas',
    productivity: 'Produtividade & Gestão',
    support_hr: 'Suporte & RH'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950 text-slate-100 flex flex-col animate-in fade-in duration-200">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-[#071729] border-b border-slate-800 px-4 sm:px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={closeAdminPanel}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Voltar ao Portal"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar ao Portal</span>
            </button>

            <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-blue-500/20">
                R9
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  Painel de Administração
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-400/30">
                    Admin
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Gerenciamento de sistemas, avisos e banners da Intranet
                </p>
              </div>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Supabase status indicator */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Supabase Conectado</span>
              {userEmail && <span className="text-emerald-400/70 font-mono text-[11px]">({userEmail})</span>}
            </div>

            <button
              onClick={() => refreshData()}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              title="Recarregar dados do Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
              <span className="hidden sm:inline">Sincronizar</span>
            </button>

            <button
              onClick={() => setShowSeedConfirm(true)}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-cyan-300 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              title="Gravar catálogo padrão no Supabase"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Popular Banco Nuvem</span>
            </button>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-amber-950/60 border border-slate-700 hover:border-amber-700/60 text-slate-300 hover:text-amber-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
              title="Restaurar dados padrões de fábrica"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Restaurar</span>
            </button>

            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 hover:text-red-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
              title="Sair do painel administrativo"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        
        {/* Empty Database Banner / Prompt */}
        {isDbEmpty && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/80 to-slate-900 border border-blue-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Banco de Dados Supabase Conectado (Tabelas Vazias)</h4>
                <p className="text-xs text-blue-200/80 mt-0.5">
                  As tabelas remotas estão prontas para uso. Clique ao lado para semear com o catálogo oficial inicial da R9.
                </p>
              </div>
            </div>
            <button
              onClick={handleExecuteSeed}
              disabled={isSyncing}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Semeando dados...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Popular Dados Iniciais no Supabase</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Syncing Toast / Status pill */}
        {isSyncing && (
          <div className="p-2.5 px-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-cyan-300 text-xs flex items-center gap-2 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>Sincronizando alterações com o Supabase em tempo real...</span>
          </div>
        )}
        
        {/* Metric Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sistemas Ativos</span>
              <div className="text-2xl font-black text-white mt-1">{systems.length}</div>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <LayoutGrid className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Comunicados no Feed</span>
              <div className="text-2xl font-black text-white mt-1">{notices.length}</div>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Bell className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Banners no Carrossel</span>
              <div className="text-2xl font-black text-white mt-1">{slides.length}</div>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-800 flex items-center gap-2 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('systems')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer border-b-2 ${
              activeTab === 'systems'
                ? 'border-blue-500 text-blue-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Sistemas & Ferramentas ({systems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notices')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer border-b-2 ${
              activeTab === 'notices'
                ? 'border-blue-500 text-blue-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Comunicados & Avisos ({notices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('slides')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer border-b-2 ${
              activeTab === 'slides'
                ? 'border-blue-500 text-blue-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Banners de Destaque ({slides.length})</span>
          </button>
        </div>

        {/* TAB 1: SISTEMAS */}
        {activeTab === 'systems' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Action & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
              
              <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrar por nome, URL ou descrição..."
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas as Categorias</option>
                  <option value="r9_core">Sistemas Core R9</option>
                  <option value="communication_sales">Comunicação & Vendas</option>
                  <option value="productivity">Produtividade & Gestão</option>
                  <option value="support_hr">Suporte & RH</option>
                </select>
              </div>

              <button
                onClick={() => handleOpenSystemModal()}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Novo Sistema</span>
              </button>

            </div>

            {/* Systems Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Ícone</th>
                      <th className="py-3.5 px-4">Nome & Descrição</th>
                      <th className="py-3.5 px-4">Categoria</th>
                      <th className="py-3.5 px-4">Badge / Status</th>
                      <th className="py-3.5 px-4">Link URL</th>
                      <th className="py-3.5 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredSystems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          Nenhum sistema encontrado com os filtros informados.
                        </td>
                      </tr>
                    ) : (
                      filteredSystems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/50 transition">
                          <td className="py-3 px-4">
                            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
                              <DynamicIcon name={item.icon || 'Layers'} className="w-4 h-4" />
                            </div>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-bold text-white text-sm flex items-center gap-2">
                              {item.name}
                              {item.isPrimary && (
                                <span className="text-[10px] text-amber-400" title="Sistema Core Destaque">
                                  ★
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {item.description}
                            </p>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                              {categoryLabels[item.category] || item.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {item.badge && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                  {item.badge}
                                </span>
                              )}
                              <span className={`w-2 h-2 rounded-full ${
                                item.status === 'updated' 
                                  ? 'bg-cyan-400' 
                                  : item.status === 'maintenance' 
                                  ? 'bg-amber-400' 
                                  : 'bg-emerald-400'
                              }`} title={`Status: ${item.status || 'online'}`} />
                            </div>
                          </td>
                          <td className="py-3 px-4 max-w-[180px] truncate font-mono text-[11px] text-blue-400">
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:underline flex items-center gap-1"
                            >
                              <span className="truncate">{item.url}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenSystemModal(item)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600/30 hover:text-blue-300 text-slate-400 transition cursor-pointer"
                                title="Editar Sistema"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSystem(item.id, item.name)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/30 hover:text-red-300 text-slate-400 transition cursor-pointer"
                                title="Excluir Sistema"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMUNICADOS */}
        {activeTab === 'notices' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Action Bar */}
            <div className="flex items-center justify-between bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Comunicados da Barra Lateral</h3>
                <p className="text-xs text-slate-400">Estes avisos alimentam o painel de Atualizações Recentes e o sino de notificações.</p>
              </div>

              <button
                onClick={() => handleOpenNoticeModal()}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition cursor-pointer flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Novo Comunicado</span>
              </button>
            </div>

            {/* Notices Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Prioridade</th>
                      <th className="py-3.5 px-4">Categoria</th>
                      <th className="py-3.5 px-4">Título & Resumo</th>
                      <th className="py-3.5 px-4">Data</th>
                      <th className="py-3.5 px-4">Autor</th>
                      <th className="py-3.5 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {notices.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          Nenhum comunicado cadastrado.
                        </td>
                      </tr>
                    ) : (
                      notices.map((notice) => (
                        <tr key={notice.id} className="hover:bg-slate-800/50 transition">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              notice.priority === 'alta'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : notice.priority === 'destaque'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {notice.priority || 'normal'}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                              {notice.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-sm">
                            <div className="font-bold text-white text-sm">
                              {notice.title}
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {notice.summary}
                            </p>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                            {notice.date}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                            {notice.author || 'Equipe R9'}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenNoticeModal(notice)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600/30 hover:text-blue-300 text-slate-400 transition cursor-pointer"
                                title="Editar Comunicado"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteNotice(notice.id, notice.title)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/30 hover:text-red-300 text-slate-400 transition cursor-pointer"
                                title="Excluir Comunicado"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BANNERS DE DESTAQUE */}
        {activeTab === 'slides' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Action Bar */}
            <div className="flex items-center justify-between bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">Banners do Carrossel Principal</h3>
                <p className="text-xs text-slate-400">Alterne os destaques visuais exibidos no topo do portal corporativo.</p>
              </div>

              <button
                onClick={() => handleOpenSlideModal()}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition cursor-pointer flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Novo Banner</span>
              </button>
            </div>

            {/* Slides Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className="rounded-2xl p-5 border border-slate-800 shadow-md relative overflow-hidden flex flex-col justify-between"
                  style={{ background: slide.gradient || '#0A2540' }}
                >
                  <div className="relative z-10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-cyan-300 text-[10px] font-bold uppercase tracking-wider border border-white/20">
                        {slide.badge}
                      </span>
                      <span className="text-xs font-mono text-white/60">
                        Slide {index + 1} de {slides.length}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white leading-snug">
                      {slide.title}
                    </h4>

                    {slide.subtitle && (
                      <p className="text-xs text-cyan-200/90 font-medium">
                        {slide.subtitle}
                      </p>
                    )}

                    <p className="text-xs text-slate-200/80 line-clamp-2">
                      {slide.description}
                    </p>
                  </div>

                  <div className="relative z-10 pt-4 mt-3 border-t border-white/15 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-cyan-300 bg-white/10 px-2.5 py-1 rounded-lg">
                      Botão: {slide.primaryActionText}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenSlideModal(slide)}
                        className="p-2 rounded-lg bg-black/40 hover:bg-black/60 text-white transition cursor-pointer"
                        title="Editar Banner"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSlide(slide.id, slide.title)}
                        className="p-2 rounded-lg bg-red-500/30 hover:bg-red-500/50 text-red-200 transition cursor-pointer"
                        title="Remover Banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* --- MODAL: EDIT/CREATE SYSTEM --- */}
      {isSystemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div 
            className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0A2540] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">
                {editingSystem ? 'Editar Sistema' : 'Cadastrar Novo Sistema'}
              </h3>
              <button
                onClick={() => setIsSystemModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSystem} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome do Sistema *
                </label>
                <input
                  type="text"
                  value={systemForm.name}
                  onChange={(e) => setSystemForm({ ...systemForm, name: e.target.value })}
                  placeholder="Ex: R9Bot Mailer"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {systemFormErrors.name && (
                  <p className="text-red-400 text-xs mt-1">{systemFormErrors.name}</p>
                )}
              </div>

              {/* URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL de Acesso *
                </label>
                <input
                  type="text"
                  value={systemForm.url}
                  onChange={(e) => setSystemForm({ ...systemForm, url: e.target.value })}
                  placeholder="https://exemplo.r9hub.corp/"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {systemFormErrors.url && (
                  <p className="text-red-400 text-xs mt-1">{systemFormErrors.url}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descrição Curta *
                </label>
                <textarea
                  value={systemForm.description}
                  onChange={(e) => setSystemForm({ ...systemForm, description: e.target.value })}
                  rows={2}
                  placeholder="Explique brevemente para que serve a ferramenta..."
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {systemFormErrors.description && (
                  <p className="text-red-400 text-xs mt-1">{systemFormErrors.description}</p>
                )}
              </div>

              {/* Category & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={systemForm.category}
                    onChange={(e) => setSystemForm({ ...systemForm, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="r9_core">Sistemas Core R9</option>
                    <option value="communication_sales">Comunicação & Vendas</option>
                    <option value="productivity">Produtividade & Gestão</option>
                    <option value="support_hr">Suporte & RH</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Badge de Destaque (Opcional)
                  </label>
                  <input
                    type="text"
                    value={systemForm.badge}
                    onChange={(e) => setSystemForm({ ...systemForm, badge: e.target.value })}
                    placeholder="Ex: Produção, Novo, Essencial"
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Icon Selector with Preview */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Ícone Representativo</span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    Visualização: 
                    <span className="p-1 rounded bg-slate-800 text-blue-400 inline-flex">
                      <DynamicIcon name={systemForm.icon} className="w-3.5 h-3.5" />
                    </span>
                  </span>
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 max-h-28 overflow-y-auto">
                  {POPULAR_ICONS.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setSystemForm({ ...systemForm, icon: iconName })}
                      className={`p-2 rounded-lg border transition cursor-pointer flex items-center gap-1.5 text-xs ${
                        systemForm.icon === iconName
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <DynamicIcon name={iconName} className="w-3.5 h-3.5" />
                      <span className="text-[10px]">{iconName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status & Primary Checkbox */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status Operacional
                  </label>
                  <select
                    value={systemForm.status}
                    onChange={(e) => setSystemForm({ ...systemForm, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="online">Online (Operacional)</option>
                    <option value="updated">Atualizado (Novo Recurso)</option>
                    <option value="maintenance">Manutenção Programada</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={systemForm.isPrimary}
                      onChange={(e) => setSystemForm({ ...systemForm, isPrimary: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700 focus:ring-blue-500"
                    />
                    <span>Destacar como Sistema Core (★)</span>
                  </label>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Palavras-chave / Tags de Busca (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={systemForm.tagsInput}
                  onChange={(e) => setSystemForm({ ...systemForm, tagsInput: e.target.value })}
                  placeholder="vendas, disparador, relatorio, ti"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSystemModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition cursor-pointer"
                >
                  {editingSystem ? 'Salvar Alterações' : 'Cadastrar Sistema'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: EDIT/CREATE NOTICE --- */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div 
            className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0A2540] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">
                {editingNotice ? 'Editar Comunicado' : 'Publicar Novo Comunicado'}
              </h3>
              <button
                onClick={() => setIsNoticeModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNotice} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título do Comunicado *
                </label>
                <input
                  type="text"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  placeholder="Ex: Manutenção Preventiva dos Servidores"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {noticeFormErrors.title && (
                  <p className="text-red-400 text-xs mt-1">{noticeFormErrors.title}</p>
                )}
              </div>

              {/* Category, Priority & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={noticeForm.category}
                    onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Comunicado">Comunicado</option>
                    <option value="TI & Sistemas">TI & Sistemas</option>
                    <option value="RH & Pessoas">RH & Pessoas</option>
                    <option value="Novidade">Novidade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={noticeForm.priority}
                    onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="alta">Alta (Urgente)</option>
                    <option value="destaque">Destaque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Data / Horário *
                  </label>
                  <input
                    type="text"
                    value={noticeForm.date}
                    onChange={(e) => setNoticeForm({ ...noticeForm, date: e.target.value })}
                    placeholder="Ex: Hoje, 10:30"
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {noticeFormErrors.date && (
                    <p className="text-red-400 text-xs mt-1">{noticeFormErrors.date}</p>
                  )}
                </div>
              </div>

              {/* Author */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Autor / Departamento Emissor
                </label>
                <input
                  type="text"
                  value={noticeForm.author}
                  onChange={(e) => setNoticeForm({ ...noticeForm, author: e.target.value })}
                  placeholder="Ex: Equipe de Infraestrutura & TI"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Short Summary */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Resumo Rápido (exibido na barra lateral) *
                </label>
                <textarea
                  value={noticeForm.summary}
                  onChange={(e) => setNoticeForm({ ...noticeForm, summary: e.target.value })}
                  rows={2}
                  placeholder="Resumo em 1 ou 2 frases curtas..."
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {noticeFormErrors.summary && (
                  <p className="text-red-400 text-xs mt-1">{noticeFormErrors.summary}</p>
                )}
              </div>

              {/* Full Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Conteúdo Completo (exibido no modal de leitura)
                </label>
                <textarea
                  value={noticeForm.fullContent}
                  onChange={(e) => setNoticeForm({ ...noticeForm, fullContent: e.target.value })}
                  rows={4}
                  placeholder="Descreva todos os detalhes do informe, procedimentos ou orientações..."
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition cursor-pointer"
                >
                  {editingNotice ? 'Salvar Alterações' : 'Publicar Comunicado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: EDIT/CREATE SLIDE --- */}
      {isSlideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div 
            className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0A2540] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">
                {editingSlide ? 'Editar Banner de Destaque' : 'Cadastrar Novo Banner'}
              </h3>
              <button
                onClick={() => setIsSlideModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tag / Badge do Banner
                </label>
                <input
                  type="text"
                  value={slideForm.badge}
                  onChange={(e) => setSlideForm({ ...slideForm, badge: e.target.value })}
                  placeholder="Ex: Inteligência Artificial, Campanhas, Gestão"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título Principal *
                </label>
                <input
                  type="text"
                  value={slideForm.title}
                  onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                  placeholder="Ex: Nova Versão R9Bot V2 está Ativa"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {slideFormErrors.title && (
                  <p className="text-red-400 text-xs mt-1">{slideFormErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subtítulo de Apoio
                </label>
                <input
                  type="text"
                  value={slideForm.subtitle}
                  onChange={(e) => setSlideForm({ ...slideForm, subtitle: e.target.value })}
                  placeholder="Ex: Mais velocidade e modelos atualizados"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descrição Detalhada *
                </label>
                <textarea
                  value={slideForm.description}
                  onChange={(e) => setSlideForm({ ...slideForm, description: e.target.value })}
                  rows={2}
                  placeholder="Texto explicativo do slide..."
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {slideFormErrors.description && (
                  <p className="text-red-400 text-xs mt-1">{slideFormErrors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Texto do Botão
                  </label>
                  <input
                    type="text"
                    value={slideForm.primaryActionText}
                    onChange={(e) => setSlideForm({ ...slideForm, primaryActionText: e.target.value })}
                    placeholder="Ex: Acessar R9Bot V2"
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Link de Redirecionamento (URL)
                  </label>
                  <input
                    type="text"
                    value={slideForm.primaryActionUrl}
                    onChange={(e) => setSlideForm({ ...slideForm, primaryActionUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Estilo de Gradiente
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: 'Azul Intranet R9', val: 'linear-gradient(135deg, #0A2540 0%, #0052CC 100%)' },
                    { label: 'Slate & Royal Blue', val: 'linear-gradient(135deg, #0F172A 0%, #1E40AF 100%)' },
                    { label: 'Ciano & Deep Sky', val: 'linear-gradient(135deg, #082F49 0%, #0284C7 100%)' },
                    { label: 'Indigo & Electric Blue', val: 'linear-gradient(135deg, #1E1B4B 0%, #2563EB 100%)' },
                  ].map((grad) => (
                    <button
                      key={grad.label}
                      type="button"
                      onClick={() => setSlideForm({ ...slideForm, gradient: grad.val })}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 cursor-pointer ${
                        slideForm.gradient === grad.val
                          ? 'border-cyan-400 bg-slate-800'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-md shrink-0" style={{ background: grad.val }} />
                      <span className="truncate">{grad.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSlideModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition cursor-pointer"
                >
                  {editingSlide ? 'Salvar Banner' : 'Criar Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CONFIRMATION MODAL: RESET TO DEFAULTS --- */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-base">Restaurar Padrões de Fábrica?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Esta ação redefinirá todos os sistemas, avisos e banners para o estado original inicial da plataforma. Todas as edições e adições salvas serão substituídas.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  resetToDefaults();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition cursor-pointer"
              >
                Sim, Restaurar Dados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL CUSTOMIZADO: CONFIRMAR EXCLUSÃO --- */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="font-bold text-white text-base">Confirmar Exclusão</h3>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Tem certeza que deseja remover este item? Esta ação não pode ser desfeita.
            </p>

            {itemToDelete.name && (
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 flex items-center gap-2">
                <span className="text-slate-400">Item:</span>
                <span className="font-semibold text-white truncate">{itemToDelete.name}</span>
              </div>
            )}

            {itemDeleteError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{itemDeleteError}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setItemToDelete(null);
                  setItemDeleteError(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition cursor-pointer flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-red-600/30"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Removendo...</span>
                  </>
                ) : (
                  'Confirmar Exclusão'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CONFIRMATION MODAL: POPULAR DADOS NO SUPABASE --- */}
      {showSeedConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-cyan-400">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <Database className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="font-bold text-white text-base">Popular Banco Supabase</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Deseja popular as tabelas do Supabase com os dados padrão do R9 HUB? Os sistemas, avisos e banners serão cadastrados no banco de dados na nuvem.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSeedConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteSeed}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer flex items-center gap-2 shadow-lg shadow-blue-600/30"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- NOTIFICAÇÃO TOAST DE FEEDBACK --- */}
      {feedbackMessage && (
        <div className={`fixed top-5 right-5 z-60 max-w-md p-4 rounded-xl border shadow-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 ${
          feedbackMessage.type === 'success' 
            ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200' 
            : 'bg-red-950/95 border-red-500/50 text-red-200'
        }`}>
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs">
            <p className="font-semibold text-white">
              {feedbackMessage.type === 'success' ? 'Sucesso' : 'Atenção / Erro'}
            </p>
            <p className="mt-0.5 leading-relaxed">{feedbackMessage.text}</p>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
