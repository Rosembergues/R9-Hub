import { CarouselSlide, NoticeItem, SystemItem, BirthdayPerson } from '../types';

export const INITIAL_SYSTEMS: SystemItem[] = [
  {
    id: 'r9-mailer',
    name: 'R9Bot Mailer',
    url: 'https://r9-mailer.vercel.app/',
    description: 'Ferramenta oficial de disparo, validação e criação de e-mails em HTML para campanhas de marketing e relacionamento da equipe.',
    category: 'communication_sales',
    icon: 'Mail',
    badge: 'Produção',
    isPrimary: true,
    status: 'online',
    tags: ['email', 'mailer', 'html', 'marketing', 'disparador', 'newsletter', 'campanha']
  },
  {
    id: 'r9-planner',
    name: 'R9 Planner',
    url: 'https://r9-planner.vercel.app/',
    description: 'Planejador ágil e gerenciador de tarefas, sprints e demandas do time com visão Kanban e cronogramas de entrega.',
    category: 'productivity',
    icon: 'CalendarCheck',
    badge: 'Essencial',
    isPrimary: true,
    status: 'online',
    tags: ['planner', 'tarefas', 'projetos', 'kanban', 'sprint', 'gestao', 'demandas']
  },
  {
    id: 'r9-sales',
    name: 'R9 Sales',
    url: 'https://r9-sales.vercel.app/',
    description: 'Repositório central e painel de vendas, scripts de negociação, templates de mensagens e métricas comerciais da operação.',
    category: 'communication_sales',
    icon: 'TrendingUp',
    badge: 'Comercial',
    isPrimary: true,
    status: 'online',
    tags: ['vendas', 'sales', 'crm', 'mensagens', 'comercial', 'leads', 'pitch', 'campanhas']
  },
  {
    id: 'r9bot-v2',
    name: 'IA Studio / R9Bot V2',
    url: 'https://r9bot-v2.ai.studio/',
    description: 'Central corporativa de inteligência artificial generativa, agentes automatizados e assistência inteligente para a equipe R9.',
    category: 'r9_core',
    icon: 'Bot',
    badge: 'IA & Inovação',
    isPrimary: true,
    status: 'updated',
    tags: ['ia', 'ai', 'r9bot', 'automacao', 'studio', 'gemini', 'inteligencia artificial', 'chat']
  },
  {
    id: 'servicedesk-ti',
    name: 'ServiceDesk & Chamados TI',
    url: 'https://suporte.r9hub.corp/',
    description: 'Portal de suporte técnico, requisições de acessos a sistemas corporativos, manutenção de equipamentos e chamados de TI.',
    category: 'support_hr',
    icon: 'Headphones',
    badge: 'Suporte',
    isPrimary: false,
    status: 'online',
    tags: ['suporte', 'ti', 'chamados', 'helpdesk', 'servicenow', 'acesso', 'senha', 'computador']
  },
  {
    id: 'base-conhecimento',
    name: 'Base de Conhecimento & Wiki R9',
    url: 'https://wiki.r9hub.corp/',
    description: 'Repositório documental com Procedimentos Operacionais Padrão (POPs), manuais de onboarding, políticas e guias práticos.',
    category: 'productivity',
    icon: 'BookOpen',
    badge: 'Documentação',
    isPrimary: false,
    status: 'online',
    tags: ['wiki', 'manuais', 'documentos', 'pops', 'procedimentos', 'onboarding', 'conhecimento']
  },
  {
    id: 'calendario-escalas',
    name: 'Calendário & Escalas do Time',
    url: 'https://calendario.r9hub.corp/',
    description: 'Agenda corporativa integrada com escalas de plantão, marcos do trimestre, feriados institucionais e reuniões gerais (All-Hands).',
    category: 'productivity',
    icon: 'Calendar',
    badge: 'Agenda',
    isPrimary: false,
    status: 'online',
    tags: ['calendario', 'agenda', 'escala', 'reuniao', 'all hands', 'feriados', 'eventos']
  },
  {
    id: 'portal-gente-rh',
    name: 'Portal Gente & Gestão (RH)',
    url: 'https://rh.r9hub.corp/',
    description: 'Acesso seguro ao espelho de ponto eletrônico, solicitação e consulta de férias, holerites, informes de rendimentos e benefícios.',
    category: 'support_hr',
    icon: 'Users',
    badge: 'Pessoas',
    isPrimary: false,
    status: 'online',
    tags: ['rh', 'ponto', 'holerite', 'ferias', 'beneficios', 'gente', 'salario', 'declaracao']
  },
  {
    id: 'drive-ativos',
    name: 'Drive de Ativos & Brand Kit',
    url: 'https://drive.r9hub.corp/ativos',
    description: 'Biblioteca oficial em nuvem com logotipos em alta definição, templates de apresentações PPT, paletas de cores e papelaria oficial.',
    category: 'communication_sales',
    icon: 'FolderArchive',
    badge: 'Brand Kit',
    isPrimary: false,
    status: 'online',
    tags: ['drive', 'arquivos', 'design', 'logos', 'templates', 'apresentacoes', 'branding', 'fotos']
  },
  {
    id: 'painel-bi',
    name: 'Painel de BI & Indicadores',
    url: 'https://bi.r9hub.corp/',
    description: 'Dashboard executivo em tempo real com KPIs de entrega, metas comerciais, volumetria operacional e relatórios executivos.',
    category: 'r9_core',
    icon: 'PieChart',
    badge: 'Analytics',
    isPrimary: false,
    status: 'online',
    tags: ['bi', 'dashboards', 'metricas', 'kpis', 'powerbi', 'relatorios', 'indicadores', 'dados']
  }
];

export const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 'slide-r9bot',
    badge: 'Inteligência Artificial',
    title: 'Nova Versão R9Bot V2 está Ativa no IA Studio',
    subtitle: 'Mais velocidade, modelos atualizados e integrações com o fluxo do time',
    description: 'Experimente a nova central de IA com suporte avançado a prompts corporativos, automação de resumos e geração de conteúdos em segundos.',
    primaryActionText: 'Acessar R9Bot V2',
    primaryActionUrl: 'https://r9bot-v2.ai.studio/',
    isExternal: true,
    themeColor: 'from-blue-900 via-blue-800 to-indigo-950',
    gradient: 'linear-gradient(135deg, #0A2540 0%, #0052CC 100%)',
    icon: 'Bot'
  },
  {
    id: 'slide-mailer',
    badge: 'Comunicação & Campanhas',
    title: 'R9Bot Mailer: Novos Modelos de E-mail HTML',
    subtitle: 'Padronização visual e alta taxa de entrega garantida',
    description: 'Confira os novos componentes de e-mail responsivos disponíveis para as campanhas de captação e retenção deste ciclo.',
    primaryActionText: 'Abrir R9 Mailer',
    primaryActionUrl: 'https://r9-mailer.vercel.app/',
    isExternal: true,
    themeColor: 'from-slate-900 via-blue-900 to-blue-950',
    gradient: 'linear-gradient(135deg, #0F172A 0%, #1E40AF 100%)',
    icon: 'Mail'
  },
  {
    id: 'slide-planner',
    badge: 'Gestão de Entregas',
    title: 'Sprint Semanal: Atualize seu R9 Planner',
    subtitle: 'Alinhamento contínuo das metas e prioridades da equipe',
    description: 'Organize suas tarefas prioritárias no Kanban da equipe. Lembre-se de revisar os cartões em progresso até o fechamento da semana.',
    primaryActionText: 'Ir para o R9 Planner',
    primaryActionUrl: 'https://r9-planner.vercel.app/',
    isExternal: true,
    themeColor: 'from-sky-950 via-blue-900 to-slate-900',
    gradient: 'linear-gradient(135deg, #082F49 0%, #0284C7 100%)',
    icon: 'CalendarCheck'
  },
  {
    id: 'slide-sales',
    badge: 'Resultados & Vendas',
    title: 'R9 Sales: Repositório de Argumentações Atualizado',
    subtitle: 'Disponível novo guia de contorno de objeções e ofertas',
    description: 'Acesse o painel comercial com as últimas mensagens testadas e estratégias de conversão de leads para impulsionar os resultados.',
    primaryActionText: 'Explorar R9 Sales',
    primaryActionUrl: 'https://r9-sales.vercel.app/',
    isExternal: true,
    themeColor: 'from-blue-950 via-indigo-900 to-slate-900',
    gradient: 'linear-gradient(135deg, #1E1B4B 0%, #2563EB 100%)',
    icon: 'TrendingUp'
  }
];

export const RECENT_NOTICES: NoticeItem[] = [
  {
    id: 'notice-1',
    title: 'Manutenção Preventiva de Servidores e Redes',
    summary: 'Janela programada no próximo domingo das 02h às 06h. Serviços externos não serão impactados.',
    fullContent: 'Informamos a todos os colaboradores que haverá uma janela de manutenção programada para atualização dos patches de segurança dos servidores internos. Durante esse período de 4 horas, o acesso aos drives locais e ao LDAP poderá apresentar breves oscilações. Os sistemas web em nuvem (R9 Mailer, R9 Planner, R9 Sales e IA Studio) continuarão funcionando normalmente.',
    date: 'Hoje, 09:30',
    category: 'TI & Sistemas',
    priority: 'alta',
    author: 'Equipe de Infraestrutura & TI'
  },
  {
    id: 'notice-2',
    title: 'Campanha de Segurança da Informação: LGPD & Phishing',
    summary: 'Novo módulo de capacitação obrigatório de 15 minutos já está disponível na plataforma de treinamentos.',
    fullContent: 'Reforçamos a importância das boas práticas de segurança digital: nunca compartilhe senhas nem clique em links suspeitos sem verificar o remetente oficial. O treinamento anual sobre privacidade de dados e conformidade LGPD deve ser concluído por todos os membros da equipe até o final do mês corrente.',
    date: 'Ontem, 16:45',
    category: 'Comunicado',
    priority: 'destaque',
    author: 'Comitê de Governança & Segurança'
  },
  {
    id: 'notice-3',
    title: 'Novo Modelo de Relatório no R9 Sales',
    summary: 'Adicionada visualização por taxa de conversão por canal de disparo no painel comercial.',
    fullContent: 'A equipe de produto disponibilizou uma atualização no painel do R9 Sales que permite aos coordenadores exportar dados de desempenho em planilhas unificadas e comparar o engajamento com os disparos efetuados via R9 Mailer.',
    date: '07 de Set, 14:10',
    category: 'Novidade',
    priority: 'normal',
    author: 'Coordenação de Operações R9'
  },
  {
    id: 'notice-4',
    title: 'Prazo para Solicitação de Férias e Ajuste de Ponto',
    summary: 'Lembrete aos gestores e analistas: aprovações no Portal RH até dia 15 de cada mês.',
    fullContent: 'Para garantir o correto processamento da folha e das escalas de revezamento das próximas semanas, solicitamos que todas as pendências de espelho de ponto e requisições de período de descanso sejam validadas dentro do prazo regulamentar.',
    date: '05 de Set, 11:00',
    category: 'RH & Pessoas',
    priority: 'normal',
    author: 'Gente & Cultura'
  }
];

export const BIRTHDAYS_DATA: BirthdayPerson[] = [
  {
    id: 'b1',
    name: 'Juliana Castro',
    role: 'Especialista de Operações',
    date: '12 de Setembro',
    department: 'Marketing & Vendas'
  },
  {
    id: 'b2',
    name: 'Rodrigo Medeiros',
    role: 'Desenvolvedor Frontend',
    date: '18 de Setembro',
    department: 'Engenharia R9'
  },
  {
    id: 'b3',
    name: 'Camila Albuquerque',
    role: 'Coordenadora de Projetos',
    date: '24 de Setembro',
    department: 'Planejamento'
  }
];

export const CORPORATE_SHORTCUTS = [
  { label: 'Ramal Helpdesk TI', value: 'Ramal 4004 (Opção 2)', icon: 'PhoneCall', url: 'tel:4004' },
  { label: 'Escala de Plantão', value: 'Semana 37 / Equipe Alfa', icon: 'Clock', url: '#calendario' },
  { label: 'Canal de Dúvidas Teams', value: '#suporte-r9-geral', icon: 'MessageSquare', url: 'https://teams.microsoft.com' },
  { label: 'Status dos Sistemas', value: '100% Operacional', icon: 'ShieldCheck', url: '#status' }
];
