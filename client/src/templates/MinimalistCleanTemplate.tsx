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

export const MinimalistCleanTemplate: React.FC<TemplateProps> = ({ data, theme, id = 'resume-preview' }) => {
  const { personalInfo, profileSummary, experiences, educations, skills, languages, certifications, interests, references, customSections, sectionsOrder, disabledSections } = data;
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

  return (
    <div
      id={id}
      className={`a4-sheet bg-white text-slate-900 shadow-xl p-9 flex flex-col gap-5 overflow-hidden relative ${fontFamilyClass}`}
      style={{ minHeight: '297mm', width: '210mm' }}
    >
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between pb-4 border-b-2" style={{ borderColor: accentColor }}>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">
            {personalInfo.firstName} <span style={{ color: accentColor }}>{personalInfo.lastName}</span>
          </h1>
          {personalInfo.title && (
            <h2 className="text-sm font-semibold text-slate-600 tracking-wider uppercase">
              {personalInfo.title}
            </h2>
          )}

          {/* Contact Bar Inline */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 pt-2">
            {personalInfo.email && (
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3" style={{ color: accentColor }} />
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" style={{ color: accentColor }} />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {Boolean(personalInfo.city?.trim() || personalInfo.country?.trim()) && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" style={{ color: accentColor }} />
                <span>
                  {[personalInfo.city?.trim(), personalInfo.country?.trim()].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center gap-1">
                <Linkedin className="w-3 h-3" style={{ color: accentColor }} />
                <span>{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>
              </div>
            )}
            {personalInfo.website && (
              <div className="flex items-center gap-1">
                <Globe className="w-3 h-3" style={{ color: accentColor }} />
                <span>{personalInfo.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
              </div>
            )}
            {personalInfo.github && (
              <div className="flex items-center gap-1">
                <Github className="w-3 h-3" style={{ color: accentColor }} />
                <span>{personalInfo.github.replace(/^https?:\/\/(www\.)?/, '')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Photo if provided */}
        {personalInfo.photoUrl && (
          <div className="shrink-0 ml-4">
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

      {/* SECTIONS IN ORDER */}
      {sectionsOrder?.map((sectionKey) => {
        if (!isEnabled(sectionKey)) return null;

        // Profile / Summary
        if (sectionKey === 'profile' && profileSummary) {
          return (
            <div key="profile" className="space-y-1.5">
              <h3
                className="text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                Profil & Objectifs
              </h3>
              <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line text-justify pl-4 border-l border-slate-200">
                {profileSummary}
              </p>
            </div>
          );
        }

        // Experiences
        if (sectionKey === 'experience' && experiences && experiences.length > 0) {
          return (
            <div key="experience" className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                Expérience Professionnelle
              </h3>
              <div className="space-y-3 pl-4 border-l border-slate-200">
                {experiences.map((exp) => (
                  <div key={exp.id} className="space-y-0.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-slate-900">{exp.title}</span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {exp.startDate} - {exp.current ? 'Présent' : exp.endDate || '-'}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold" style={{ color: accentColor }}>
                      {exp.company} {exp.city ? `• ${exp.city}` : ''}
                    </div>
                    {exp.description && (
                      <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line mt-1">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // Education
        if (sectionKey === 'education' && educations && educations.length > 0) {
          return (
            <div key="education" className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                Formation & Diplômes
              </h3>
              <div className="space-y-2 pl-4 border-l border-slate-200">
                {educations.map((edu) => (
                  <div key={edu.id} className="space-y-0.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-slate-900">{edu.degree}</span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {edu.startDate} - {edu.current ? 'En cours' : edu.endDate || '-'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-700 font-medium">
                      {edu.school} {edu.city ? `• ${edu.city}` : ''}
                    </div>
                    {edu.description && (
                      <p className="text-[10px] text-slate-600 italic">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // Skills
        if (sectionKey === 'skills' && skills && skills.length > 0) {
          return (
            <div key="skills" className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                Compétences
              </h3>
              <div className="pl-4 border-l border-slate-200 flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="text-[11px] font-medium px-2.5 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200 flex items-center"
                  >
                    <span>{skill.name}</span>
                  </span>
                ))}
              </div>
            </div>
          );
        }

        // Languages
        if (sectionKey === 'languages' && languages && languages.length > 0) {
          return (
            <div key="languages" className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                Langues
              </h3>
              <div className="pl-4 border-l border-slate-200 flex flex-wrap gap-4 text-xs">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">{lang.language}</span>
                    <span className="text-slate-500 text-[11px]">({lang.level})</span>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // Certifications
        if (sectionKey === 'certifications' && certifications && certifications.length > 0) {
          return (
            <div key="certifications" className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                Certifications & Distinctions
              </h3>
              <div className="pl-4 border-l border-slate-200 space-y-1.5">
                {certifications.map((cert) => (
                  <div key={cert.id} className="flex justify-between items-start text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{cert.title}</span>
                      <span className="text-slate-600 text-[11px]"> : {cert.issuer}</span>
                      {cert.description && (
                        <div className="text-[10px] text-slate-500">{cert.description}</div>
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

        // Interests
        if (sectionKey === 'interests' && interests && interests.length > 0) {
          return (
            <div key="interests" className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                Centres d'intérêt
              </h3>
              <div className="pl-4 border-l border-slate-200 flex flex-wrap gap-2 text-xs text-slate-700">
                {interests.map((interest) => (
                  <span key={interest.id} className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    {interest.name}
                  </span>
                ))}
              </div>
            </div>
          );
        }

        // References
        if (sectionKey === 'references' && references && references.length > 0) {
          return (
            <div key="references" className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                Références
              </h3>
              <div className="pl-4 border-l border-slate-200 grid grid-cols-2 gap-3 text-xs">
                {references.map((ref) => (
                  <div key={ref.id} className="bg-slate-50 p-2 rounded border border-slate-100">
                    <div className="font-bold text-slate-900">{ref.name}</div>
                    <div className="text-slate-600 text-[11px]">{ref.role} : {ref.company}</div>
                    {ref.phone && <div className="text-[10px] text-slate-500">{ref.phone}</div>}
                    {ref.email && <div className="text-[10px] text-slate-500">{ref.email}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // Custom sections
        if (sectionKey.startsWith('custom_')) {
          const customSec = customSections?.find((cs) => cs.key === sectionKey);
          if (!customSec || !customSec.items?.length) return null;

          return (
            <div key={sectionKey} className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
                {customSec.title}
              </h3>
              <div className="pl-4 border-l border-slate-200 space-y-1.5">
                {customSec.items.map((item) => (
                  <div key={item.id} className="text-xs space-y-0.5">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{item.title}</span>
                      {item.date && <span className="text-[10px] text-slate-500">{item.date}</span>}
                    </div>
                    {item.subtitle && <div className="text-[11px] text-slate-600">{item.subtitle}</div>}
                    {item.description && (
                      <p className="text-[10px] text-slate-600 leading-relaxed">{item.description}</p>
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
