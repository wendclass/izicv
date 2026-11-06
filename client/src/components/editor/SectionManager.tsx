import React, { useState } from 'react';
import { ResumeData, SectionKey } from '../../types/cv';
import { PersonalInfoForm } from './forms/PersonalInfoForm';
import { ProfileSummaryForm } from './forms/ProfileSummaryForm';
import { ExperienceForm } from './forms/ExperienceForm';
import { EducationForm } from './forms/EducationForm';
import { SkillsForm } from './forms/SkillsForm';
import { LanguagesForm } from './forms/LanguagesForm';
import { CertificationsForm } from './forms/CertificationsForm';
import { InterestsForm } from './forms/InterestsForm';
import { ReferencesForm } from './forms/ReferencesForm';
import { CustomSectionForm } from './forms/CustomSectionForm';
import {
  User,
  Sparkles,
  Briefcase,
  GraduationCap,
  Wrench,
  Languages,
  Award,
  Heart,
  UserCheck,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Plus,
} from 'lucide-react';

interface SectionManagerProps {
  data: ResumeData;
  onChange: (updatedData: ResumeData) => void;
}

export const SectionManager: React.FC<SectionManagerProps> = ({ data, onChange }) => {
  const [activeSection, setActiveSection] = useState<string>('personal');

  const {
    personalInfo,
    profileSummary,
    experiences,
    educations,
    skills,
    languages,
    certifications,
    interests,
    references,
    customSections = [],
    sectionsOrder = [],
    disabledSections = [],
  } = data;

  const toggleSectionEnabled = (sectionKey: SectionKey, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentlyDisabled = disabledSections.includes(sectionKey);
    const updatedDisabled = isCurrentlyDisabled
      ? disabledSections.filter((k) => k !== sectionKey)
      : [...disabledSections, sectionKey];

    onChange({
      ...data,
      disabledSections: updatedDisabled,
    });
  };

  const moveSection = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    const newOrder = [...sectionsOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    onChange({
      ...data,
      sectionsOrder: newOrder,
    });
  };

  const addCustomSection = () => {
    const customId = Date.now().toString();
    const customKey = `custom_${customId}` as SectionKey;
    const newCustom = {
      id: customId,
      key: customKey,
      title: 'Section Personnalisée',
      items: [],
    };

    onChange({
      ...data,
      customSections: [...customSections, newCustom],
      sectionsOrder: [...sectionsOrder, customKey],
    });
    setActiveSection(customKey);
  };

  const deleteCustomSection = (key: string) => {
    onChange({
      ...data,
      customSections: customSections.filter((cs) => cs.key !== key),
      sectionsOrder: sectionsOrder.filter((k) => k !== key),
      disabledSections: disabledSections.filter((k) => k !== key),
    });
    if (activeSection === key) {
      setActiveSection('personal');
    }
  };

  const getSectionMetadata = (key: SectionKey) => {
    switch (key) {
      case 'profile':
        return { label: 'Profil & Résumé', icon: Sparkles, count: profileSummary ? 1 : 0 };
      case 'experience':
        return { label: 'Expériences professionnelles', icon: Briefcase, count: experiences.length };
      case 'education':
        return { label: 'Formations & Diplômes', icon: GraduationCap, count: educations.length };
      case 'skills':
        return { label: 'Compétences', icon: Wrench, count: skills.length };
      case 'languages':
        return { label: 'Langues', icon: Languages, count: languages.length };
      case 'certifications':
        return { label: 'Certifications & Distinctions', icon: Award, count: certifications.length };
      case 'interests':
        return { label: 'Centres d\'intérêt', icon: Heart, count: interests.length };
      case 'references':
        return { label: 'Références', icon: UserCheck, count: references.length };
      default:
        if (key.startsWith('custom_')) {
          const found = customSections.find((cs) => cs.key === key);
          return {
            label: found?.title || 'Section personnalisée',
            icon: BookOpen,
            count: found?.items?.length || 0,
            isCustom: true,
          };
        }
        return { label: key, icon: BookOpen, count: 0 };
    }
  };

  const renderSectionContent = (key: SectionKey) => {
    switch (key) {
      case 'profile':
        return (
          <ProfileSummaryForm
            value={profileSummary}
            onChange={(val) => onChange({ ...data, profileSummary: val })}
          />
        );
      case 'experience':
        return (
          <ExperienceForm
            items={experiences}
            onChange={(items) => onChange({ ...data, experiences: items })}
          />
        );
      case 'education':
        return (
          <EducationForm
            items={educations}
            onChange={(items) => onChange({ ...data, educations: items })}
          />
        );
      case 'skills':
        return (
          <SkillsForm
            items={skills}
            onChange={(items) => onChange({ ...data, skills: items })}
          />
        );
      case 'languages':
        return (
          <LanguagesForm
            items={languages}
            onChange={(items) => onChange({ ...data, languages: items })}
          />
        );
      case 'certifications':
        return (
          <CertificationsForm
            items={certifications}
            onChange={(items) => onChange({ ...data, certifications: items })}
          />
        );
      case 'interests':
        return (
          <InterestsForm
            items={interests}
            onChange={(items) => onChange({ ...data, interests: items })}
          />
        );
      case 'references':
        return (
          <ReferencesForm
            items={references}
            onChange={(items) => onChange({ ...data, references: items })}
          />
        );
      default:
        if (key.startsWith('custom_')) {
          const customSec = customSections.find((cs) => cs.key === key);
          if (!customSec) return null;
          return (
            <CustomSectionForm
              section={customSec}
              onUpdateTitle={(title) => {
                const updated = customSections.map((cs) =>
                  cs.key === key ? { ...cs, title } : cs
                );
                onChange({ ...data, customSections: updated });
              }}
              onUpdateItems={(items) => {
                const updated = customSections.map((cs) =>
                  cs.key === key ? { ...cs, items } : cs
                );
                onChange({ ...data, customSections: updated });
              }}
              onDeleteSection={() => deleteCustomSection(key)}
            />
          );
        }
        return null;
    }
  };

  return (
    <div className="space-y-3 pb-8">
      {/* 1. INFORMATIONS PERSONNELLES (Toujours en tête) */}
      <div className="border border-slate-200 rounded-2xl bg-white shadow-xs overflow-hidden">
        <div
          onClick={() => setActiveSection(activeSection === 'personal' ? '' : 'personal')}
          className="p-4 flex items-center justify-between cursor-pointer bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shadow-2xs">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">
                Informations Personnelles
              </div>
              <div className="text-[11px] text-slate-500">
                {personalInfo.firstName || personalInfo.lastName
                  ? `${personalInfo.firstName} ${personalInfo.lastName}`
                  : 'Nom, contact, réseaux et photo'}
              </div>
            </div>
          </div>

          <div className="text-slate-400">
            {activeSection === 'personal' ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>

        {activeSection === 'personal' && (
          <div className="p-4 border-t border-slate-100 animate-in fade-in duration-100">
            <PersonalInfoForm
              data={personalInfo}
              onChange={(updated) => onChange({ ...data, personalInfo: updated })}
            />
          </div>
        )}
      </div>

      {/* 2. REORDERABLE SECTIONS ACCORDION */}
      {sectionsOrder.map((key, index) => {
        const meta = getSectionMetadata(key);
        const Icon = meta.icon;
        const isExpanded = activeSection === key;
        const isEnabled = !disabledSections.includes(key);

        return (
          <div
            key={key}
            className={`border rounded-2xl bg-white shadow-xs overflow-hidden transition-all ${
              isEnabled ? 'border-slate-200' : 'border-slate-200/60 opacity-60 bg-slate-50/50'
            }`}
          >
            <div
              onClick={() => setActiveSection(isExpanded ? '' : key)}
              className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isEnabled ? 'bg-slate-100 text-slate-700' : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-xs sm:text-sm font-bold text-slate-800 truncate flex items-center gap-2">
                    <span>{meta.label}</span>
                    {meta.count > 0 && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-medium">
                        {meta.count}
                      </span>
                    )}
                  </div>
                  {!isEnabled && (
                    <span className="text-[10px] text-amber-600 font-medium">
                      Masqué du CV final
                    </span>
                  )}
                </div>
              </div>

              {/* Controls (Up, Down, Toggle Eye, Expand) */}
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={(e) => moveSection(index, 'up', e)}
                  title="Monter la section"
                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={index === sectionsOrder.length - 1}
                  onClick={(e) => moveSection(index, 'down', e)}
                  title="Descendre la section"
                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => toggleSectionEnabled(key, e)}
                  title={isEnabled ? 'Masquer la section du CV' : 'Afficher la section sur le CV'}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isEnabled
                      ? 'text-teal-600 hover:bg-teal-50'
                      : 'text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="p-4 border-t border-slate-100 bg-white animate-in fade-in duration-100">
                {renderSectionContent(key)}
              </div>
            )}
          </div>
        );
      })}

      {/* 3. ADD CUSTOM SECTION BUTTON */}
      <button
        type="button"
        onClick={addCustomSection}
        className="w-full py-3 border-2 border-dashed border-slate-300 hover:border-teal-500 bg-white hover:bg-teal-50/30 text-slate-700 hover:text-teal-800 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
      >
        <Plus className="w-4 h-4 text-teal-600" />
        Ajouter une section personnalisée
      </button>
    </div>
  );
};
