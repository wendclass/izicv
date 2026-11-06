import { TemplateDefinition } from './types';
import { ModernSidebarTemplate } from './ModernSidebarTemplate';
import { MinimalistCleanTemplate } from './MinimalistCleanTemplate';

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'modern-sidebar',
    name: 'Modèle 1 — Moderne Structuré',
    description: 'Bandeau latéral coloré avec colonne personnelle à gauche et parcours professionnel à droite.',
    badge: 'Recommandé',
    component: ModernSidebarTemplate,
  },
  {
    id: 'minimalist-clean',
    name: 'Modèle 2 — Minimaliste Épuré',
    description: 'Mise en page fluide en une seule colonne avec typographie soignée et séparateurs discrets.',
    badge: 'Populaire',
    component: MinimalistCleanTemplate,
  },
];

export function getTemplateById(id: string): TemplateDefinition {
  return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
}

export * from './types';
