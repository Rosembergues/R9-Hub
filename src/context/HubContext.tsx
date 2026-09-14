import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { SystemItem, NoticeItem, CarouselSlide } from '../types';
import { INITIAL_SYSTEMS, CAROUSEL_SLIDES, RECENT_NOTICES } from '../data/systemsData';
import { supabase } from '../lib/supabase';

const STORAGE_KEYS = {
  FAVORITES: 'r9_hub_favorites_v2',
  CUSTOM_SYSTEMS: 'r9_hub_custom_systems_v2',
};

// Database Row Types for Supabase
interface DbSystemRow {
  id: string;
  name: string;
  description: string | null;
  url: string;
  category: string;
  badge: string | null;
  icon: string | null;
  status: string | null;
  is_favorite?: boolean | null;
  tags?: string[] | null;
  created_at?: string;
}

interface DbAnnouncementRow {
  id: string;
  title: string;
  category: string;
  summary: string | null;
  content: string | null;
  priority: string | null;
  author: string | null;
  date: string | null;
  created_at?: string;
}

interface DbBannerRow {
  id: string;
  tag: string | null;
  title: string;
  description: string | null;
  button_text: string | null;
  button_url: string | null;
  gradient: string | null;
  created_at?: string;
}

interface HubContextType {
  // Data
  systems: SystemItem[];
  notices: NoticeItem[];
  slides: CarouselSlide[];
  favorites: string[];
  
  // Status indicators
  isLoading: boolean;
  isSyncing: boolean;
  isDbEmpty: boolean;
  dbError: string | null;
  refreshData: () => Promise<void>;
  seedInitialData: () => Promise<{ success: boolean; error?: string }>;

  // Auth state
  isAuthenticated: boolean;
  userEmail: string | null;
  isAdminPanelOpen: boolean;
  isLoginModalOpen: boolean;
  
  // Auth actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openAdminPanel: () => void;
  closeAdminPanel: () => void;

  // Systems actions
  addSystem: (system: Omit<SystemItem, 'id'> & { id?: string }) => Promise<{ success: boolean; error?: string }>;
  updateSystem: (id: string, updated: Partial<SystemItem>) => Promise<{ success: boolean; error?: string }>;
  deleteSystem: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleFavorite: (id: string) => void;

  // Notices actions
  addNotice: (notice: Omit<NoticeItem, 'id'> & { id?: string }) => Promise<{ success: boolean; error?: string }>;
  updateNotice: (id: string, updated: Partial<NoticeItem>) => Promise<{ success: boolean; error?: string }>;
  deleteNotice: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Carousel actions
  addSlide: (slide: Omit<CarouselSlide, 'id'> & { id?: string }) => Promise<{ success: boolean; error?: string }>;
  updateSlide: (id: string, updated: Partial<CarouselSlide>) => Promise<{ success: boolean; error?: string }>;
  deleteSlide: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Reset / Reseed
  resetToDefaults: () => Promise<{ success: boolean; error?: string }>;
}

const HubContext = createContext<HubContextType | undefined>(undefined);

// Helper mappers
function mapSystemRow(row: DbSystemRow): SystemItem {
  const rowTags = Array.isArray(row.tags) && row.tags.length > 0
    ? row.tags
    : [row.name.toLowerCase(), row.category || '', row.badge || ''].filter(Boolean);

  return {
    id: row.id,
    name: row.name,
    url: row.url,
    description: row.description || '',
    category: (row.category || 'r9_core') as SystemItem['category'],
    icon: row.icon || 'Layers',
    badge: row.badge || undefined,
    status: (row.status || 'online') as SystemItem['status'],
    tags: rowTags,
    isPrimary: row.category === 'r9_core' || row.badge === 'Core' || !!row.is_favorite,
    isCustom: false,
  };
}

function mapNoticeRow(row: DbAnnouncementRow): NoticeItem {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary || '',
    fullContent: row.content || row.summary || '',
    date: row.date || 'Recente',
    category: (row.category || 'Comunicado') as NoticeItem['category'],
    priority: (row.priority || 'normal') as NoticeItem['priority'],
    author: row.author || 'Equipe R9',
  };
}

function mapBannerRow(row: DbBannerRow): CarouselSlide {
  return {
    id: row.id,
    badge: row.tag || 'Destaque',
    title: row.title,
    subtitle: '',
    description: row.description || '',
    primaryActionText: row.button_text || 'Acessar',
    primaryActionUrl: row.button_url || '#',
    isExternal: true,
    themeColor: 'from-blue-900 via-blue-800 to-indigo-950',
    gradient: row.gradient || 'linear-gradient(135deg, #0A2540 0%, #0052CC 100%)',
    icon: 'Bot',
  };
}

export const HubProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Data states
  const [systems, setSystems] = useState<SystemItem[]>(INITIAL_SYSTEMS);
  const [notices, setNotices] = useState<NoticeItem[]>(RECENT_NOTICES);
  const [slides, setSlides] = useState<CarouselSlide[]>(CAROUSEL_SLIDES);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading favorites:', e);
    }
    return ['r9-mailer', 'r9-planner', 'r9-sales', 'r9bot-v2'];
  });

  // Loading & status
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isDbEmpty, setIsDbEmpty] = useState<boolean>(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 1. Supabase Auth Session listener
  useEffect(() => {
    // Check initial active session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.warn('Supabase getSession warning:', error.message);
      }
      setIsAuthenticated(!!session);
      setUserEmail(session?.user?.email || null);
    });

    // Listen to continuous auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setUserEmail(session?.user?.email || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. Fetch remote data from Supabase
  const fetchRemoteData = useCallback(async () => {
    setIsLoading(true);
    setDbError(null);
    try {
      // Query systems, announcements, and banners in parallel
      const [systemsRes, noticesRes, bannersRes] = await Promise.all([
        supabase.from('hub_systems').select('*').order('created_at', { ascending: true }),
        supabase.from('hub_announcements').select('*').order('created_at', { ascending: false }),
        supabase.from('hub_banners').select('*').order('created_at', { ascending: true }),
      ]);

      const hasSystems = systemsRes.data && systemsRes.data.length > 0;
      const hasNotices = noticesRes.data && noticesRes.data.length > 0;
      const hasBanners = bannersRes.data && bannersRes.data.length > 0;

      if (!hasSystems && !hasNotices && !hasBanners) {
        // Tables are empty in Supabase, flag as empty and use defaults for display
        setIsDbEmpty(true);
        setSystems(INITIAL_SYSTEMS);
        setNotices(RECENT_NOTICES);
        setSlides(CAROUSEL_SLIDES);
      } else {
        setIsDbEmpty(false);

        if (hasSystems) {
          const mappedSystems = (systemsRes.data as DbSystemRow[]).map(mapSystemRow);
          // Preserve any custom user-created local links if exists
          try {
            const customSaved = localStorage.getItem(STORAGE_KEYS.CUSTOM_SYSTEMS);
            if (customSaved) {
              const parsedCustom: SystemItem[] = JSON.parse(customSaved);
              if (Array.isArray(parsedCustom) && parsedCustom.length > 0) {
                mappedSystems.push(...parsedCustom);
              }
            }
          } catch (e) {
            console.error('Error reading custom systems:', e);
          }
          setSystems(mappedSystems);
        }

        if (hasNotices) {
          setNotices((noticesRes.data as DbAnnouncementRow[]).map(mapNoticeRow));
        }

        if (hasBanners) {
          setSlides((bannersRes.data as DbBannerRow[]).map(mapBannerRow));
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao conectar com o Supabase';
      console.error('Error fetching Supabase data:', msg);
      setDbError(msg);
      // Fallback to initial static data
      setSystems(INITIAL_SYSTEMS);
      setNotices(RECENT_NOTICES);
      setSlides(CAROUSEL_SLIDES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRemoteData();
  }, [fetchRemoteData]);

  // Persist favorites in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (e) {
      console.error('Error persisting favorites:', e);
    }
  }, [favorites]);

  // 3. Auth methods
  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsSyncing(true);
    try {
      const cleanEmail = email.trim();
      const cleanPass = pass.trim();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      setIsAuthenticated(true);
      setUserEmail(data.user?.email || null);
      setIsLoginModalOpen(false);
      setIsAdminPanelOpen(true);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao realizar login';
      return { success: false, error: message };
    } finally {
      setIsSyncing(false);
    }
  };

  const signUp = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsSyncing(true);
    try {
      const cleanEmail = email.trim();
      const cleanPass = pass.trim();
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPass,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session) {
        setIsAuthenticated(true);
        setUserEmail(data.user?.email || null);
        setIsLoginModalOpen(false);
        setIsAdminPanelOpen(true);
      }
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao cadastrar';
      return { success: false, error: message };
    } finally {
      setIsSyncing(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    setIsAuthenticated(false);
    setUserEmail(null);
    setIsAdminPanelOpen(false);
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  const openAdminPanel = () => {
    if (isAuthenticated) {
      setIsAdminPanelOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };
  const closeAdminPanel = () => setIsAdminPanelOpen(false);

  // 4. Seed Fallback: Populate initial database in Supabase
  const seedInitialData = async (): Promise<{ success: boolean; error?: string }> => {
    setIsSyncing(true);
    try {
      // 1. Seed systems using upsert on 'id'
      const systemsPayload = INITIAL_SYSTEMS.map(sys => ({
        id: sys.id,
        name: sys.name,
        description: sys.description,
        url: sys.url,
        category: sys.category,
        badge: sys.badge || null,
        icon: sys.icon,
        status: sys.status || 'online',
        is_favorite: sys.id === 'r9-mailer' || sys.id === 'r9-sales' || sys.id === 'r9bot-v2',
        tags: sys.tags || [sys.name.toLowerCase(), sys.category].filter(Boolean),
      }));

      let { error: sysError } = await supabase
        .from('hub_systems')
        .upsert(systemsPayload, { onConflict: 'id' });

      if (sysError && (sysError.message.includes("'tags' column") || sysError.message.includes('hub_systems.tags'))) {
        const payloadNoTags = systemsPayload.map(({ tags: _t, ...rest }) => rest);
        const retry = await supabase
          .from('hub_systems')
          .upsert(payloadNoTags, { onConflict: 'id' });
        sysError = retry.error;
      }

      if (sysError) {
        console.error('Error seeding systems:', sysError);
        return { success: false, error: `Erro ao semear sistemas: ${sysError.message}` };
      }

      // 2. Seed notices
      const noticesPayload = RECENT_NOTICES.map(notice => ({
        title: notice.title,
        summary: notice.summary,
        content: notice.fullContent,
        category: notice.category,
        priority: notice.priority || 'normal',
        author: notice.author,
        date: notice.date,
      }));

      const { error: notError } = await supabase.from('hub_announcements').insert(noticesPayload);
      if (notError) {
        console.error('Error seeding notices:', notError);
        return { success: false, error: `Erro ao semear comunicados: ${notError.message}` };
      }

      // 3. Seed banners
      const bannersPayload = CAROUSEL_SLIDES.map(slide => ({
        title: slide.title,
        description: slide.description,
        tag: slide.badge,
        button_text: slide.primaryActionText,
        button_url: slide.primaryActionUrl || '#',
        gradient: slide.gradient,
      }));

      const { error: banError } = await supabase.from('hub_banners').insert(bannersPayload);
      if (banError) {
        console.error('Error seeding banners:', banError);
        return { success: false, error: `Erro ao semear banners: ${banError.message}` };
      }

      // Refresh data
      await fetchRemoteData();
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha na semeadura do banco de dados';
      return { success: false, error: message };
    } finally {
      setIsSyncing(false);
    }
  };

  // 5. System CRUD with Supabase using .upsert()
  const addSystem = async (systemData: Omit<SystemItem, 'id'> & { id?: string }): Promise<{ success: boolean; error?: string }> => {
    setIsSyncing(true);
    try {
      const targetId = systemData.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sys-${Date.now()}`);

      if (isAuthenticated) {
        const dados = {
          id: targetId,
          name: systemData.name.trim(),
          description: (systemData.description || '').trim(),
          url: systemData.url.trim(),
          category: systemData.category,
          badge: systemData.badge || null,
          icon: systemData.icon || 'Layers',
          status: systemData.status || 'online',
          is_favorite: !!systemData.isPrimary,
          tags: systemData.tags || [systemData.name.toLowerCase(), systemData.category].filter(Boolean),
        };

        let { data, error } = await supabase
          .from('hub_systems')
          .upsert(dados, { onConflict: 'id' })
          .select()
          .single();

        if (error && (error.message.includes("'tags' column") || error.message.includes('hub_systems.tags'))) {
          const { tags: _ignored, ...dadosWithoutTags } = dados;
          const retry = await supabase
            .from('hub_systems')
            .upsert(dadosWithoutTags, { onConflict: 'id' })
            .select()
            .single();
          data = retry.data;
          error = retry.error;
        }

        if (error) {
          return { success: false, error: error.message };
        }

        if (data) {
          const mapped = mapSystemRow(data as DbSystemRow);
          if (dados.tags && dados.tags.length > 0) {
            mapped.tags = dados.tags;
          }
          setSystems(prev => [mapped, ...prev.filter(s => s.id !== targetId)]);
          setIsDbEmpty(false);
          return { success: true };
        }
      }

      // If not authenticated (e.g. personal custom shortcut from employee)
      const newCustomItem: SystemItem = {
        ...systemData,
        id: targetId,
        isCustom: true,
      };
      setSystems(prev => [newCustomItem, ...prev]);
      try {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_SYSTEMS) || '[]');
        localStorage.setItem(STORAGE_KEYS.CUSTOM_SYSTEMS, JSON.stringify([newCustomItem, ...existing]));
      } catch (e) {
        console.error('Error saving local custom system:', e);
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao adicionar sistema';
      return { success: false, error: msg };
    } finally {
      setIsSyncing(false);
    }
  };

  const updateSystem = async (id: string, updated: Partial<SystemItem>): Promise<{ success: boolean; error?: string }> => {
    setIsSyncing(true);
    try {
      const existing = systems.find(item => item.id === id);

      // Objeto completo contendo todos os campos obrigatórios para o upsert
      const dados = {
        id: id,
        name: (updated.name !== undefined ? updated.name : (existing?.name ?? '')).trim(),
        description: (updated.description !== undefined ? updated.description : (existing?.description ?? '')).trim(),
        url: (updated.url !== undefined ? updated.url : (existing?.url ?? '')).trim(),
        category: updated.category ?? existing?.category ?? 'r9_core',
        badge: updated.badge !== undefined ? (updated.badge || null) : (existing?.badge || null),
        icon: updated.icon ?? existing?.icon ?? 'Layers',
        status: updated.status ?? existing?.status ?? 'online',
        is_favorite: updated.isPrimary !== undefined ? !!updated.isPrimary : (existing?.isPrimary ?? favorites.includes(id) ?? false),
        tags: updated.tags ?? existing?.tags ?? [
          (updated.name ?? existing?.name ?? '').toLowerCase(),
          updated.category ?? existing?.category ?? '',
        ].filter(Boolean),
      };

      // 1. Executa .upsert() com onConflict: 'id' em vez de .update()
      let { data, error } = await supabase
        .from('hub_systems')
        .upsert(dados, { onConflict: 'id' })
        .select()
        .single();

      // Caso a tabela remota do Supabase ainda não possua a coluna 'tags' criada
      if (error && (error.message.includes("'tags' column") || error.message.includes('hub_systems.tags'))) {
        const { tags: _ignored, ...dadosWithoutTags } = dados;
        const retry = await supabase
          .from('hub_systems')
          .upsert(dadosWithoutTags, { onConflict: 'id' })
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        return { success: false, error: error.message };
      }

      if (data) {
        const mapped = mapSystemRow(data as DbSystemRow);
        if (dados.tags && dados.tags.length > 0) {
          mapped.tags = dados.tags;
        }
        setSystems(prev => {
          const exists = prev.some(item => item.id === id);
          if (exists) {
            return prev.map(item => (item.id === id ? mapped : item));
          } else {
            return [mapped, ...prev];
          }
        });
      } else {
        setSystems(prev => {
          const exists = prev.some(item => item.id === id);
          if (exists) {
            return prev.map(item => (item.id === id ? { ...item, ...updated } : item));
          } else {
            const newItem: SystemItem = {
              id,
              name: dados.name,
              url: dados.url,
              description: dados.description,
              category: dados.category as SystemItem['category'],
              icon: dados.icon,
              badge: dados.badge || undefined,
              status: dados.status as SystemItem['status'],
              isPrimary: dados.is_favorite,
              tags: dados.tags,
              isCustom: false,
            };
            return [newItem, ...prev];
          }
        });
      }

      setIsDbEmpty(false);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao atualizar sistema';
      return { success: false, error: msg };
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteSystem = async (id: string): Promise<{ success: boolean; error?: string }> => {
    setIsSyncing(true);
    try {
      const { error } = await supabase.from('hub_systems').delete().eq('id', id);
      if (error) {
        // If it's a locally saved custom shortcut, delete locally
        try {
          const existing: SystemItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_SYSTEMS) || '[]');
          const filtered = existing.filter(i => i.id !== id);
          localStorage.setItem(STORAGE_KEYS.CUSTOM_SYSTEMS, JSON.stringify(filtered));
        } catch {
          // ignore
        }
      }

      setSystems(prev => prev.filter(item => item.id !== id));
      setFavorites(prev => prev.filter(favId => favId !== id));
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir sistema';
      return { success: false, error: msg };
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleFavorite = (systemId: string) => {
    setFavorites(prev =>
      prev.includes(systemId)
        ? prev.filter(id => id !== systemId)
        : [...prev, systemId]
    );
  };

  // 6. Notices CRUD with Supabase
  const addNotice = async (noticeData: Omit<NoticeItem, 'id'> & { id?: string }): Promise<{ success: boolean; error?: string }> => {
    setIsSyncing(true);
    try {
      const payload = {
        title: noticeData.title,
        summary: noticeData.summary,
        content: noticeData.fullContent,
        category: noticeData.category,
        priority: noticeData.priority || 'normal',
        author: noticeData.author || 'Equipe R9',
        date: noticeData.date || 'Hoje',
      };

      const { data, error } = await supabase
        .from('hub_announcements')
        .insert(payload)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      if (data) {
        const mapped = mapNoticeRow(data as DbAnnouncementRow);
        setNotices(prev => [mapped, ...prev]);
        setIsDbEmpty(false);
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao adicionar comunicado';
      return { success: false, error: msg };
    } finally {
      setIsSyncing(false);
    }
  };

  const updateNotice = async (id: string, updated: Partial<NoticeItem>): Promise<{ success: boolean; error?: string }> => {
    setIsSyncing(true);
    try {
      const payload: Record<string, unknown> = {};
      if (updated.title !== undefined) payload.title = updated.title;
      if (updated.summary !== undefined) payload.summary = updated.summary;
      if (updated.fullContent !== undefined) payload.content = updated.fullContent;
      if (updated.category !== undefined) payload.category = updated.category;
      if (updated.priority !== undefined) payload.priority = updated.priority;
      if (updated.author !== undefined) payload.author = updated.author;
      if (updated.date !== undefined) payload.date = updated.date;

      const { data, error } = await supabase
        .from('hub_announcements')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      if (data) {
        const mapped = mapNoticeRow(data as DbAnnouncementRow);
        setNotices(prev => prev.map(item => (item.id === id ? mapped : item)));
      } else {
        setNotices(prev => prev.map(item => (item.id === id ? { ...item, ...updated } : item)));
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao atualizar comunicado';
      return { success: false, error: msg };
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteNotice = async (id: string): Promise<{ success: boolean; error?: string }> => {
    setIsSyncing(true);
    try {
      const { error } = await supabase.from('hub_announcements').delete().eq('id', id);
      if (error) {
        return { success: false, error: error.message };
      }
      setNotices(prev => prev.filter(item => item.id !== id));
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir comunicado';
      return { success: false, error: msg };
    } finally {
      setIsSyncing(false);
    }
  };

  // 7. Carousel CRUD with Supabase
  const addSlide = async (slideData: Omit<CarouselSlide, 'id'> & { id?: string }): Promise<{ success: boolean; error?: string }> => {
    setIsSyncing(true);
    try {
      const payload = {
        title: slideData.title,
        description: slideData.description,
        tag: slideData.badge || 'Destaque',
        button_text: slideData.primaryActionText || 'Acessar',
        button_url: slideData.primaryActionUrl || '#',
        gradient: slideData.gradient || 'linear-gradient(135deg, #0A2540 0%, #0052CC 100%)',
      };

      const { data, error } = await supabase
        .from('hub_banners')
        .insert(payload)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      if (data) {
        const mapped = mapBannerRow(data as DbBannerRow);
        setSlides(prev => [...prev, mapped]);
        setIsDbEmpty(false);
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao adicionar banner';
      return { success: false, error: msg };
    } finally {
      setIsSyncing(false);
    }
  };

  const updateSlide = async (id: string, updated: Partial<CarouselSlide>): Promise<{ success: boolean; error?: string }> => {
    setIsSyncing(true);
    try {
      const payload: Record<string, unknown> = {};
      if (updated.title !== undefined) payload.title = updated.title;
      if (updated.description !== undefined) payload.description = updated.description;
      if (updated.badge !== undefined) payload.tag = updated.badge;
      if (updated.primaryActionText !== undefined) payload.button_text = updated.primaryActionText;
      if (updated.primaryActionUrl !== undefined) payload.button_url = updated.primaryActionUrl;
      if (updated.gradient !== undefined) payload.gradient = updated.gradient;

      const { data, error } = await supabase
        .from('hub_banners')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      if (data) {
        const mapped = mapBannerRow(data as DbBannerRow);
        setSlides(prev => prev.map(item => (item.id === id ? mapped : item)));
      } else {
        setSlides(prev => prev.map(item => (item.id === id ? { ...item, ...updated } : item)));
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao atualizar banner';
      return { success: false, error: msg };
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteSlide = async (id: string): Promise<{ success: boolean; error?: string }> => {
    setIsSyncing(true);
    try {
      const { error } = await supabase.from('hub_banners').delete().eq('id', id);
      if (error) {
        return { success: false, error: error.message };
      }
      setSlides(prev => prev.filter(item => item.id !== id));
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir banner';
      return { success: false, error: msg };
    } finally {
      setIsSyncing(false);
    }
  };

  // 8. Factory reset / Reseed
  const resetToDefaults = async (): Promise<{ success: boolean; error?: string }> => {
    if (isAuthenticated) {
      return await seedInitialData();
    }
    setSystems(INITIAL_SYSTEMS);
    setNotices(RECENT_NOTICES);
    setSlides(CAROUSEL_SLIDES);
    setFavorites(['r9-mailer', 'r9-planner', 'r9-sales', 'r9bot-v2']);
    return { success: true };
  };

  return (
    <HubContext.Provider
      value={{
        systems,
        notices,
        slides,
        favorites,
        isLoading,
        isSyncing,
        isDbEmpty,
        dbError,
        refreshData: fetchRemoteData,
        seedInitialData,
        isAuthenticated,
        userEmail,
        isAdminPanelOpen,
        isLoginModalOpen,
        login,
        signUp,
        logout,
        openLoginModal,
        closeLoginModal,
        openAdminPanel,
        closeAdminPanel,
        addSystem,
        updateSystem,
        deleteSystem,
        toggleFavorite,
        addNotice,
        updateNotice,
        deleteNotice,
        addSlide,
        updateSlide,
        deleteSlide,
        resetToDefaults,
      }}
    >
      {children}
    </HubContext.Provider>
  );
};

export const useHub = (): HubContextType => {
  const context = useContext(HubContext);
  if (!context) {
    throw new Error('useHub must be used within a HubProvider');
  }
  return context;
};
