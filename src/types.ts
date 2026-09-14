export type SystemCategory = 
  | 'all'
  | 'favorites'
  | 'r9_core'
  | 'communication_sales'
  | 'productivity'
  | 'support_hr';

export interface SystemItem {
  id: string;
  name: string;
  url: string;
  description: string;
  category: 'r9_core' | 'communication_sales' | 'productivity' | 'support_hr';
  icon: string;
  badge?: string;
  isPrimary?: boolean;
  status?: 'online' | 'maintenance' | 'updated';
  tags: string[];
  isCustom?: boolean;
}

export interface NoticeItem {
  id: string;
  title: string;
  summary: string;
  fullContent: string;
  date: string;
  category: 'Comunicado' | 'TI & Sistemas' | 'RH & Pessoas' | 'Novidade';
  priority?: 'alta' | 'normal' | 'destaque';
  author: string;
  tagColor?: string;
}

export interface CarouselSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  primaryActionText: string;
  primaryActionUrl?: string;
  isExternal?: boolean;
  themeColor: string;
  gradient: string;
  icon: string;
}

export interface BirthdayPerson {
  id: string;
  name: string;
  role: string;
  date: string;
  department: string;
  avatarUrl?: string;
}
