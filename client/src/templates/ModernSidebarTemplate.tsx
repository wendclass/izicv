import React from 'react';
import { TemplateProps } from './types';
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  Github,
  Briefcase,
  GraduationCap,
  Award,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { ResumePill, ResumePillContainer } from '../components/common/ResumePill';
import { getContrastingTextColor, getDerivedPillStyles } from '../utils/contrast';
import { cleanUrl, formatUrl, renderFormattedDescription } from '../utils/textFormatting';

export const ModernSidebarTemplate: React.FC<TemplateProps> = ({ data, theme, id = 'resume-preview' }) => {
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

  // Calcul dynamique du contraste WCAG (ratio >= 4,5:1) pour la colonne latérale
  const sidebarContrast = getContrastingTextColor(accentColor);
  const sidebarTextColor = sidebarContrast.color;
  const isLightSidebar = sidebarContrast.isLightBg;
  const sidebarBorderColor = isLightSidebar ? 'rgba(15, 23, 42, 0.20)' : 'rgba(255, 255, 255, 0.28)';
  const sidebarMutedColor = isLightSidebar ? '#334155' : 'rgba(255, 255, 255, 0.85)';
  const sidebarPillStyles = getDerivedPillStyles(accentColor, 'onAccentBg');

  // Contact avec liens cliquables et coupure saine
  const renderContact = () => (
    <div className="space-y-2 text-xs" style={{ color: sidebarTextColor, breakInside: 'avoid' }}>
      {personalInfo.email && (
        <div className="flex items-center gap-2" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
          <Mail size={14} className="shrink-0 opacity-80" />
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
        <div className="flex items-center gap-2">
          <Phone size={14} className="shrink-0 opacity-80" />
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
        <div className="flex items-center gap-2" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
          <MapPin size={14} className="shrink-0 opacity-80" />
          <span>
            {[personalInfo.city?.trim(), personalInfo.country?.trim()].filter(Boolean).join(', ')}
          </span>
        </div>
      )}
      {personalInfo.linkedin && (
        <div className="flex items-center gap-2" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
          <Linkedin size={14} className="shrink-0 opacity-80" />
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
        <div className="flex items-center gap-2" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
          <Globe size={14} className="shrink-0 opacity-80" />
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
        <div className="flex items-center gap-2" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
          <Github size={14} className="shrink-0 opacity-80" />
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
  );

  return (
    <div
      id={id}
      className={`a4-sheet text-slate-800 shadow-xl flex flex-row overflow-hidden relative ${fontFamilyClass}`}
      style={{
        minHeight: '297mm',
        width: '210mm',
        fontVariantLigatures: 'none',
        // Fond dégradé strict : la colonne latérale reste colorée sur 100% de la hauteur sur toutes les pages
        background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} 34%, #ffffff 34%, #ffffff 100%)`,
      }}
    >
      {/* COLONNE LATÉRALE GAUCHE (34% de largeur) */}
      <div
        className="w-[34%] shrink-0 p-6 flex flex-col gap-6"
        style={{
          color: sidebarTextColor,
        }}
      >
        {/* Photo si présente */}
        {personalInfo.photoUrl && (
          <div className="flex justify-center avoid-break" style={{ breakInside: 'avoid' }}>
            <div
              className="w-32 h-32 rounded-full overflow-hidden shadow-md"
              style={{
                border: `3px solid ${sidebarBorderColor}`,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }}
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

        {/* Coordonnées */}
        <div className="avoid-break" style={{ breakInside: 'avoid' }}>
          <h3
            className="text-xs uppercase font-bold tracking-wider mb-3 pb-1 flex items-center gap-1.5 avoid-break-after"
            style={{
              borderBottom: `1px solid ${sidebarBorderColor}`,
              color: sidebarTextColor,
              breakAfter: 'avoid',
            }}
          >
            Contact
          </h3>
          {renderContact()}
        </div>

        {/* Compétences (Section 4.2 : pastilles robustes sans jauge) */}
        {isEnabled('skills') && skills && skills.length > 0 && (
          <div className="avoid-break" style={{ breakInside: 'avoid' }}>
            <h3
              className="text-xs uppercase font-bold tracking-wider mb-3 pb-1 flex items-center gap-1.5 avoid-break-after"
              style={{
                borderBottom: `1px solid ${sidebarBorderColor}`,
                color: sidebarTextColor,
                breakAfter: 'avoid',
              }}
            >
              Compétences
            </h3>
            <ResumePillContainer>
              {skills.map((skill) => (
                <ResumePill
                  key={skill.id}
                  bg={sidebarPillStyles.bg}
                  color={sidebarPillStyles.color}
                  border={sidebarPillStyles.border}
                >
                  {skill.name}
                </ResumePill>
              ))}
            </ResumePillContainer>
          </div>
        )}

        {/* Langues (Section 4.2 : ligne en 2 parties alignées sur la ligne de base) */}
        {isEnabled('languages') && languages && languages.length > 0 && (
          <div className="avoid-break" style={{ breakInside: 'avoid' }}>
            <h3
              className="text-xs uppercase font-bold tracking-wider mb-3 pb-1 flex items-center gap-1.5 avoid-break-after"
              style={{
                borderBottom: `1px solid ${sidebarBorderColor}`,
                color: sidebarTextColor,
                breakAfter: 'avoid',
              }}
            >
              Langues
            </h3>
            <div className="space-y-2 text-xs">
              {languages.map((lang) => (
                <div
                  key={lang.id}
                  className="w-full flex justify-between items-baseline flex-wrap gap-x-2 gap-y-1 avoid-break"
                  style={{ breakInside: 'avoid' }}
                >
                  <span
                    className="font-semibold text-[11px] leading-tight"
                    style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                  >
                    {lang.language}
                  </span>
                  <ResumePill
                    bg={sidebarPillStyles.bg}
                    color={sidebarPillStyles.color}
                    border={sidebarPillStyles.border}
                    style={{ padding: '0.8mm 2.2mm', fontSize: '10px' }}
                  >
                    {lang.level}
                  </ResumePill>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Centres d'intérêt (Section 4.2 : pastilles robustes) */}
        {isEnabled('interests') && interests && interests.length > 0 && (
          <div className="avoid-break" style={{ breakInside: 'avoid' }}>
            <h3
              className="text-xs uppercase font-bold tracking-wider mb-3 pb-1 flex items-center gap-1.5 avoid-break-after"
              style={{
                borderBottom: `1px solid ${sidebarBorderColor}`,
                color: sidebarTextColor,
                breakAfter: 'avoid',
              }}
            >
              Centres d'intérêt
            </h3>
            <ResumePillContainer>
              {interests.map((interest) => (
                <ResumePill
                  key={interest.id}
                  bg={sidebarPillStyles.bg}
                  color={sidebarPillStyles.color}
                  border={sidebarPillStyles.border}
                  style={{ padding: '1mm 2.4mm', fontSize: '10px' }}
                >
                  {interest.name}
                </ResumePill>
              ))}
            </ResumePillContainer>
          </div>
        )}

        {/* Références */}
        {isEnabled('references') && references && references.length > 0 && (
          <div className="avoid-break" style={{ breakInside: 'avoid' }}>
            <h3
              className="text-xs uppercase font-bold tracking-wider mb-3 pb-1 flex items-center gap-1.5 avoid-break-after"
              style={{
                borderBottom: `1px solid ${sidebarBorderColor}`,
                color: sidebarTextColor,
                breakAfter: 'avoid',
              }}
            >
              Références
            </h3>
            <div className="space-y-2 text-[11px]">
              {references.map((ref) => (
                <div
                  key={ref.id}
                  className="p-2.5 rounded-lg avoid-break"
                  style={{
                    backgroundColor: sidebarPillStyles.bg,
                    border: `1px solid ${sidebarPillStyles.border}`,
                    breakInside: 'avoid',
                  }}
                >
                  <div className="font-bold">{ref.name}</div>
                  <div className="text-[10px]" style={{ color: sidebarMutedColor }}>
                    {ref.role} : {ref.company}
                  </div>
                  {ref.phone && <div className="text-[9px] opacity-85 mt-0.5">{ref.phone}</div>}
                  {ref.email && <div className="text-[9px] opacity-85">{ref.email}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CONTENU PRINCIPAL DROIT (66% de largeur) */}
      <div className="w-[66%] p-7 flex flex-col gap-5 bg-white">
        {/* En-tête : Nom, prénom et titre professionnel */}
        <div className="border-b pb-4 border-slate-200 avoid-break" style={{ breakInside: 'avoid' }}>
          <h1
            className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight"
            style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
          >
            <span style={{ color: accentColor }}>{personalInfo.firstName}</span>{' '}
            <span>{personalInfo.lastName}</span>
          </h1>
          {personalInfo.title && (
            <h2
              className="text-base font-semibold text-slate-600 mt-1 uppercase tracking-wide"
              style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
            >
              {personalInfo.title}
            </h2>
          )}
        </div>

        {/* Rendu ordonné des sections */}
        {sectionsOrder?.map((sectionKey) => {
          if (!isEnabled(sectionKey)) return null;

          // Profil professionnel
          if (sectionKey === 'profile' && profileSummary?.trim()) {
            return (
              <div key="profile" className="space-y-1.5 avoid-break" style={{ breakInside: 'avoid' }}>
                <h3
                  className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 pb-1 border-b-2 avoid-break-after"
                  style={{ borderColor: accentColor, color: accentColor, breakAfter: 'avoid' }}
                >
                  <Sparkles size={14} />
                  Profil Professionnel
                </h3>
                <p
                  className="text-xs leading-relaxed text-slate-700 whitespace-pre-line text-left"
                  style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                >
                  {profileSummary}
                </p>
              </div>
            );
          }

          // Expériences professionnelles (Section 4.3 : listes à puces propres avec retrait suspendu)
          if (sectionKey === 'experience' && experiences && experiences.length > 0) {
            return (
              <div key="experience" className="space-y-3">
                <h3
                  className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 pb-1 border-b-2 avoid-break-after"
                  style={{ borderColor: accentColor, color: accentColor, breakAfter: 'avoid' }}
                >
                  <Briefcase size={14} />
                  Expériences Professionnelles
                </h3>
                <div className="space-y-3">
                  {experiences.map((exp) => (
                    <div
                      key={exp.id}
                      className="relative pl-3 border-l-2 border-slate-200 space-y-1 avoid-break"
                      style={{ breakInside: 'avoid' }}
                    >
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

          // Formations & Diplômes
          if (sectionKey === 'education' && educations && educations.length > 0) {
            return (
              <div key="education" className="space-y-3">
                <h3
                  className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 pb-1 border-b-2 avoid-break-after"
                  style={{ borderColor: accentColor, color: accentColor, breakAfter: 'avoid' }}
                >
                  <GraduationCap size={14} />
                  Formations & Diplômes
                </h3>
                <div className="space-y-2.5">
                  {educations.map((edu) => (
                    <div
                      key={edu.id}
                      className="relative pl-3 border-l-2 border-slate-200 space-y-1 avoid-break"
                      style={{ breakInside: 'avoid' }}
                    >
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
                      <div className="text-[11px] font-medium text-slate-700">
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

          // Certifications & Distinctions
          if (sectionKey === 'certifications' && certifications && certifications.length > 0) {
            return (
              <div key="certifications" className="space-y-2 avoid-break" style={{ breakInside: 'avoid' }}>
                <h3
                  className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 pb-1 border-b-2 avoid-break-after"
                  style={{ borderColor: accentColor, color: accentColor, breakAfter: 'avoid' }}
                >
                  <Award size={14} />
                  Certifications & Distinctions
                </h3>
                <div className="space-y-1.5">
                  {certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="text-xs flex justify-between items-start gap-2 avoid-break"
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

          // Sections personnalisées
          if (sectionKey.startsWith('custom_')) {
            const customSec = customSections?.find((cs) => cs.key === sectionKey);
            if (!customSec || !customSec.items?.length) return null;

            return (
              <div key={sectionKey} className="space-y-2 avoid-break" style={{ breakInside: 'avoid' }}>
                <h3
                  className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 pb-1 border-b-2 avoid-break-after"
                  style={{ borderColor: accentColor, color: accentColor, breakAfter: 'avoid' }}
                >
                  <BookOpen size={14} />
                  {customSec.title}
                </h3>
                <div className="space-y-2">
                  {customSec.items.map((item) => (
                    <div
                      key={item.id}
                      className="text-xs space-y-0.5 avoid-break"
                      style={{ breakInside: 'avoid' }}
                    >
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
    </div>
  );
};
