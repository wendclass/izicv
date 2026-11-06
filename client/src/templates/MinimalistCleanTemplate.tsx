import React from 'react';
import { TemplateProps } from './types';
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  Github,
} from 'lucide-react';
import { ResumePill, ResumePillContainer } from '../components/common/ResumePill';
import { getDerivedPillStyles } from '../utils/contrast';
import { cleanUrl, formatUrl, renderFormattedDescription } from '../utils/textFormatting';

export const MinimalistCleanTemplate: React.FC<TemplateProps> = ({ data, theme, id = 'resume-preview' }) => {
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
    customSections,
    sectionsOrder,
    disabledSections,
  } = data;

  const accentColor = theme?.primaryColor || '#0d9488';
  const fontFamilyClass =
    theme?.fontFamily === 'merriweather'
      ? 'font-serif'
      : theme?.fontFamily === 'montserrat'
      ? 'font-sans'
      : theme?.fontFamily === 'jakarta'
      ? 'font-sans'
      : 'font-sans';

  const isEnabled = (key: string) => !disabledSections?.includes(key as any);

  // Styles de pastille dérivés de la couleur d'accent sur fond blanc
  const pillStyles = getDerivedPillStyles(accentColor, 'onWhiteBg');

  return (
    <div
      id={id}
      className={`a4-sheet bg-white text-slate-900 shadow-xl p-9 flex flex-col gap-5 overflow-hidden relative ${fontFamilyClass}`}
      style={{ minHeight: '297mm', width: '210mm', fontVariantLigatures: 'none' }}
    >
      {/* SECTION EN-TÊTE : NOM, TITRE ET CONTACT */}
      <div
        className="flex items-center justify-between pb-4 border-b-2 avoid-break"
        style={{ borderColor: accentColor, breakInside: 'avoid' }}
      >
        <div className="space-y-1 max-w-full">
          <h1
            className="text-3xl font-bold tracking-tight text-slate-900 uppercase"
            style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
          >
            {personalInfo.firstName} <span style={{ color: accentColor }}>{personalInfo.lastName}</span>
          </h1>
          {personalInfo.title && (
            <h2
              className="text-sm font-semibold text-slate-600 tracking-wider uppercase"
              style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
            >
              {personalInfo.title}
            </h2>
          )}

          {/* Coordonnées horizontales avec liens cliquables */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-600 pt-2">
            {personalInfo.email && (
              <div className="flex items-center gap-1.5" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                <Mail size={13} style={{ color: accentColor }} className="shrink-0" />
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="hover:underline transition-opacity"
                  style={{ color: 'inherit' }}
                >
                  {personalInfo.email}
                </a>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-1.5">
                <Phone size={13} style={{ color: accentColor }} className="shrink-0" />
                <a
                  href={`tel:${personalInfo.phone}`}
                  className="hover:underline transition-opacity"
                  style={{ color: 'inherit' }}
                >
                  {personalInfo.phone}
                </a>
              </div>
            )}
            {Boolean(personalInfo.city?.trim() || personalInfo.country?.trim()) && (
              <div className="flex items-center gap-1.5" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                <MapPin size={13} style={{ color: accentColor }} className="shrink-0" />
                <span>
                  {[personalInfo.city?.trim(), personalInfo.country?.trim()].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center gap-1.5" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                <Linkedin size={13} style={{ color: accentColor }} className="shrink-0" />
                <a
                  href={formatUrl(personalInfo.linkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline transition-opacity"
                  style={{ color: 'inherit' }}
                >
                  {cleanUrl(personalInfo.linkedin)}
                </a>
              </div>
            )}
            {personalInfo.website && (
              <div className="flex items-center gap-1.5" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                <Globe size={13} style={{ color: accentColor }} className="shrink-0" />
                <a
                  href={formatUrl(personalInfo.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline transition-opacity"
                  style={{ color: 'inherit' }}
                >
                  {cleanUrl(personalInfo.website)}
                </a>
              </div>
            )}
            {personalInfo.github && (
              <div className="flex items-center gap-1.5" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                <Github size={13} style={{ color: accentColor }} className="shrink-0" />
                <a
                  href={formatUrl(personalInfo.github)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline transition-opacity"
                  style={{ color: 'inherit' }}
                >
                  {cleanUrl(personalInfo.github)}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Photo si présente */}
        {personalInfo.photoUrl && (
          <div className="shrink-0 ml-4 avoid-break" style={{ breakInside: 'avoid' }}>
            <div
              className="w-24 h-24 rounded-lg overflow-hidden border-2 shadow-sm"
              style={{ borderColor: accentColor }}
            >
              <img
                src={personalInfo.photoUrl}
                alt={`${personalInfo.firstName} ${personalInfo.lastName}`}
                className="w-full h-full object-cover"
                style={{ transform: `scale(${personalInfo.photoZoom || 1})` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTIONS DU CV DANS L'ORDRE CHOISI */}
      {sectionsOrder?.map((sectionKey) => {
        if (!isEnabled(sectionKey)) return null;

        // Profil & Objectifs
        if (sectionKey === 'profile' && profileSummary?.trim()) {
          return (
            <div key="profile" className="space-y-1.5 avoid-break" style={{ breakInside: 'avoid' }}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2 avoid-break-after">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                Profil & Objectifs
              </h3>
              <p
                className="text-xs leading-relaxed text-slate-700 whitespace-pre-line text-left pl-4 border-l border-slate-200"
                style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
              >
                {profileSummary}
              </p>
            </div>
          );
        }

        // Expériences Professionnelles (Section 4.3 : listes à puces propres avec retrait suspendu)
        if (sectionKey === 'experience' && experiences && experiences.length > 0) {
          return (
            <div key="experience" className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2 avoid-break-after">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                Expériences Professionnelles
              </h3>
              <div className="pl-4 border-l border-slate-200 space-y-3">
                {experiences.map((exp) => (
                  <div key={exp.id} className="space-y-1 avoid-break" style={{ breakInside: 'avoid' }}>
                    <div className="flex justify-between items-baseline gap-2">
                      <span
                        className="text-xs font-bold text-slate-900"
                        style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                      >
                        {exp.title}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 shrink-0">
                        {exp.startDate ? `${exp.startDate} - ` : ''}
                        {exp.current ? 'Présent' : exp.endDate || ''}
                      </span>
                    </div>
                    <div className="text-[11px] font-medium" style={{ color: accentColor }}>
                      <span>{exp.company}</span>
                      {exp.city ? <span>, {exp.city}</span> : null}
                    </div>
                    {exp.description && (
                      <div className="text-[11px] text-slate-600 mt-1">
                        {renderFormattedDescription(exp.description, {
                          className: 'text-[11px] text-slate-600',
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // Formations & Études
        if (sectionKey === 'education' && educations && educations.length > 0) {
          return (
            <div key="education" className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2 avoid-break-after">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                Formations & Études
              </h3>
              <div className="pl-4 border-l border-slate-200 space-y-2.5">
                {educations.map((edu) => (
                  <div key={edu.id} className="space-y-0.5 avoid-break" style={{ breakInside: 'avoid' }}>
                    <div className="flex justify-between items-baseline gap-2">
                      <span
                        className="text-xs font-bold text-slate-900"
                        style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                      >
                        {edu.degree}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 shrink-0">
                        {edu.startDate ? `${edu.startDate} - ` : ''}
                        {edu.current ? 'En cours' : edu.endDate || ''}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <span>{edu.school}</span>
                      {edu.city ? <span>, {edu.city}</span> : null}
                    </div>
                    {edu.description && (
                      <div className="text-[10px] text-slate-600 italic mt-0.5">
                        {renderFormattedDescription(edu.description, {
                          className: 'text-[10px] text-slate-600 italic',
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // Compétences (Section 4.2 : pastilles robustes sans jauge, fond dérivé de l'accent)
        if (sectionKey === 'skills' && skills && skills.length > 0) {
          return (
            <div key="skills" className="space-y-2 avoid-break" style={{ breakInside: 'avoid' }}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2 avoid-break-after">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                Compétences
              </h3>
              <div className="pl-4 border-l border-slate-200">
                <ResumePillContainer>
                  {skills.map((skill) => (
                    <ResumePill
                      key={skill.id}
                      bg={pillStyles.bg}
                      color={pillStyles.color}
                      border={pillStyles.border}
                    >
                      {skill.name}
                    </ResumePill>
                  ))}
                </ResumePillContainer>
              </div>
            </div>
          );
        }

        // Langues (Section 4.2 : alignées sur la ligne de base, libellé écrit)
        if (sectionKey === 'languages' && languages && languages.length > 0) {
          return (
            <div key="languages" className="space-y-2 avoid-break" style={{ breakInside: 'avoid' }}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2 avoid-break-after">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                Langues
              </h3>
              <div className="pl-4 border-l border-slate-200 flex flex-wrap gap-x-6 gap-y-2 text-xs">
                {languages.map((lang) => (
                  <div
                    key={lang.id}
                    className="flex items-baseline gap-2 avoid-break"
                    style={{ breakInside: 'avoid' }}
                  >
                    <span
                      className="font-bold text-slate-900"
                      style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                    >
                      {lang.language}
                    </span>
                    <ResumePill
                      bg={pillStyles.bg}
                      color={pillStyles.color}
                      border={pillStyles.border}
                      style={{ padding: '0.6mm 2mm', fontSize: '10px' }}
                    >
                      {lang.level}
                    </ResumePill>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // Certifications & Distinctions
        if (sectionKey === 'certifications' && certifications && certifications.length > 0) {
          return (
            <div key="certifications" className="space-y-2 avoid-break" style={{ breakInside: 'avoid' }}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2 avoid-break-after">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                Certifications & Distinctions
              </h3>
              <div className="pl-4 border-l border-slate-200 space-y-1.5">
                {certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex justify-between items-start text-xs gap-2 avoid-break"
                    style={{ breakInside: 'avoid' }}
                  >
                    <div>
                      <span className="font-bold text-slate-900">{cert.title}</span>
                      <span className="text-slate-600 text-[11px]">
                        {cert.issuer ? ` : ${cert.issuer}` : ''}
                      </span>
                      {cert.description && (
                        <div className="text-[10px] text-slate-500 mt-0.5">{cert.description}</div>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 shrink-0 ml-2">
                      {cert.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // Centres d'intérêt
        if (sectionKey === 'interests' && interests && interests.length > 0) {
          return (
            <div key="interests" className="space-y-2 avoid-break" style={{ breakInside: 'avoid' }}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2 avoid-break-after">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                Centres d'intérêt
              </h3>
              <div className="pl-4 border-l border-slate-200">
                <ResumePillContainer>
                  {interests.map((interest) => (
                    <ResumePill
                      key={interest.id}
                      bg={pillStyles.bg}
                      color={pillStyles.color}
                      border={pillStyles.border}
                      style={{ padding: '0.8mm 2.4mm', fontSize: '10px' }}
                    >
                      {interest.name}
                    </ResumePill>
                  ))}
                </ResumePillContainer>
              </div>
            </div>
          );
        }

        // Références
        if (sectionKey === 'references' && references && references.length > 0) {
          return (
            <div key="references" className="space-y-2 avoid-break" style={{ breakInside: 'avoid' }}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2 avoid-break-after">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                Références
              </h3>
              <div className="pl-4 border-l border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {references.map((ref) => (
                  <div
                    key={ref.id}
                    className="p-2.5 rounded-lg border avoid-break"
                    style={{
                      backgroundColor: pillStyles.bg,
                      borderColor: pillStyles.border,
                      breakInside: 'avoid',
                    }}
                  >
                    <div className="font-bold text-slate-900">{ref.name}</div>
                    <div className="text-slate-600 text-[11px]">{ref.role} : {ref.company}</div>
                    {ref.phone && <div className="text-[10px] text-slate-500 mt-0.5">{ref.phone}</div>}
                    {ref.email && <div className="text-[10px] text-slate-500">{ref.email}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // Sections personnalisées
        if (sectionKey.startsWith('custom_')) {
          const customSec = customSections?.find((cs) => cs.key === sectionKey);
          if (!customSec || !customSec.items?.length) return null;

          return (
            <div key={sectionKey} className="space-y-2 avoid-break" style={{ breakInside: 'avoid' }}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2 avoid-break-after">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
                {customSec.title}
              </h3>
              <div className="pl-4 border-l border-slate-200 space-y-1.5">
                {customSec.items.map((item) => (
                  <div key={item.id} className="text-xs space-y-0.5 avoid-break" style={{ breakInside: 'avoid' }}>
                    <div className="flex justify-between font-bold text-slate-900 gap-2">
                      <span style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                        {item.title}
                      </span>
                      {item.date && (
                        <span className="text-[10px] text-slate-500 shrink-0">{item.date}</span>
                      )}
                    </div>
                    {item.subtitle && <div className="text-[11px] text-slate-600">{item.subtitle}</div>}
                    {item.description && (
                      <div className="text-[10px] text-slate-600 mt-0.5">
                        {renderFormattedDescription(item.description, {
                          className: 'text-[10px] text-slate-600',
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
