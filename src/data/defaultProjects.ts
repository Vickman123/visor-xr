import type { Project } from '../types';

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'ffyl',
    name: 'Facultad de Filosofía y Letras',
    description: 'Módulo arquitectónico más reciente de la Facultad de Filosofía y Letras.',
    thumbnail: 'thumbnails/result.webp',
    model: 'models/result.glb',
  },
  {
    id: 'casa',
    name: 'Casa Residencial',
    description: 'Modelo arquitectónico residencial de 2 niveles con estructura de hormigón, ventanales panorámicos y terraza superior.',
    thumbnail: 'thumbnails/casa.webp',
    model: 'models/casa.glb',
  },
  {
    id: 'edificio',
    name: 'Edificio Corporativo',
    description: 'Edificio corporativo de 4 plantas con fachada acristalada, vestíbulo de doble altura y núcleo de servicios.',
    thumbnail: 'thumbnails/edificio.webp',
    model: 'models/edificio.glb',
  },
  {
    id: 'laboratorio',
    name: 'Laboratorio Tecnológico',
    description: 'Pabellón de investigación y biotecnología con atrio central acristalado, particiones modulares y bancos de trabajo.',
    thumbnail: 'thumbnails/laboratorio.webp',
    model: 'models/laboratorio.glb',
  },
];
