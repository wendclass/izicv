import React from 'react';
import { ResumeData, ResumeTheme, TemplateId } from '../types/cv';

export interface TemplateProps {
  data: ResumeData;
  theme: ResumeTheme;
  id?: string;
}

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  description: string;
  badge: string;
  component: React.FC<TemplateProps>;
}
