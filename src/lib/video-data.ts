
export type Category = string;

export const CATEGORIES: string[] = [
  'SAP FI', 'SAP CO', 'SAP SD', 'SAP MM', 'SAP PP',
  'SAP HCM', 'S/4HANA', 'Fiori', 'ABAP', 'General',
  'Coca-Cola Interno', 'Iberia Ops'
];

export const SERIES = [
  'Onboarding Corporativo',
  'Dominando SAP S/4HANA',
  'Conceptos Básicos de Finanzas'
];

export interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  categories: string[];
  duration: string;
  author: string;
  uploadDate: string;
  description: string;
  featured?: boolean;
  successStory?: boolean;
  series?: string;
  views: number;
}

export interface Permission {
  id: string;
  client: string;
  tag: string;
}

export const MOCK_PERMISSIONS: Permission[] = [
  { id: '1', client: 'Coca-Cola', tag: 'Coca-Cola Interno' },
  { id: '2', client: 'Iberia', tag: 'Iberia Ops' }
];

export const MOCK_VIDEOS: Video[] = [
  {
    id: '1',
    title: 'Introducción a SAP S/4HANA',
    description: 'Visión general de las capacidades de la última suite de SAP.',
    url: 'https://vimeo.com/76979871',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000',
    duration: '10:05',
    author: 'Altim Academy',
    uploadDate: '2023-10-25',
    categories: ['S/4HANA', 'General'],
    views: 1205,
    featured: true,
    series: 'Dominando SAP S/4HANA'
  },
  {
    id: '2',
    title: 'Gestión Financiera (FI) Básica',
    description: 'Conceptos fundamentales del módulo FI.',
    url: 'https://vimeo.com/76979871',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-98406858d0cb?auto=format&fit=crop&q=80&w=1000',
    duration: '15:30',
    author: 'Carlos Ruiz',
    uploadDate: '2023-11-02',
    categories: ['SAP FI'],
    views: 850,
    series: 'Conceptos Básicos de Finanzas'
  },
  {
    id: '3',
    title: 'Navegación en SAP Fiori',
    description: 'Aprende a moverte por la nueva interfaz de usuario.',
    url: 'https://vimeo.com/76979871',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000',
    duration: '08:15',
    author: 'Ana García',
    uploadDate: '2023-11-10',
    categories: ['Fiori', 'General'],
    views: 2100,
    featured: true,
    series: 'Dominando SAP S/4HANA'
  },
  {
    id: '4',
    title: 'Logística y Almacenes (MM)',
    description: 'Gestión de materiales y stock.',
    url: 'https://vimeo.com/76979871',
    thumbnail: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1000',
    duration: '22:45',
    author: 'Altim Academy',
    uploadDate: '2023-09-15',
    categories: ['SAP MM'],
    views: 560
  },
  {
    id: '5',
    title: 'Onboarding Coca-Cola',
    description: 'Bienvenido al equipo. Procesos internos.',
    url: 'https://vimeo.com/76979871',
    thumbnail: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=1000',
    duration: '05:00',
    author: 'RRHH Coca-Cola',
    uploadDate: '2023-12-01',
    categories: ['Coca-Cola Interno', 'General'],
    views: 120,
    series: 'Onboarding Corporativo'
  }
];
