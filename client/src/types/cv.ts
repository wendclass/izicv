export type SectionKey =
  | 'profile'
  | 'experience'
  | 'education'
  | 'skills'
  | 'languages'
  | 'certifications'
  | 'interests'
  | 'references'
  | `custom_${string}`;

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  city: string;
  country?: string;
  linkedin?: string;
  website?: string;
  github?: string;
  photoUrl?: string;
  photoZoom?: number;
}

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  city?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  school: string;
  city?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description?: string;
}

export interface SkillCategoryGroup {
  id: string;
  categoryName: string;
  skills: string[]; // e.g. ["React", "TypeScript", "Node.js"]
}

export interface SkillItem {
  id: string;
  name: string;
  level?: number; // 1 to 5
  category?: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  level: string; // "Langue maternelle", "Courant (C1/C2)", "Intermédiaire (B1/B2)", "Notions (A1/A2)"
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description?: string;
}

export interface InterestItem {
  id: string;
  name: string;
}

export interface ReferenceItem {
  id: string;
  name: string;
  role: string;
  company: string;
  phone?: string;
  email?: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
}

export interface CustomSection {
  id: string;
  key: string;
  title: string;
  items: CustomSectionItem[];
}

export interface SectionConfig {
  key: SectionKey;
  label: string;
  enabled: boolean;
  isCustom?: boolean;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  profileSummary: string;
  experiences: ExperienceItem[];
  educations: EducationItem[];
  skills: SkillItem[];
  skillGroups?: SkillCategoryGroup[];
  languages: LanguageItem[];
  certifications: CertificationItem[];
  interests: InterestItem[];
  references: ReferenceItem[];
  customSections: CustomSection[];
  sectionsOrder: SectionKey[];
  disabledSections: SectionKey[];
}

export type TemplateId = 'modern-sidebar' | 'minimalist-clean';
export type FontFamilyId = 'inter' | 'merriweather' | 'montserrat' | 'jakarta';

export interface ResumeTheme {
  primaryColor: string; // Accent color (Hex)
  fontFamily: FontFamilyId;
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  templateId: TemplateId;
  theme: ResumeTheme;
  data: ResumeData;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}
