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
  UserCheck,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export const ModernSidebarTemplate: React.FC<TemplateProps> = ({ data, theme, id = 'resume-preview' }) => {
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

  // Helper for contact item
  const renderContact = () => (
    <div className="space-y-2 text-xs opacity-95">
      {personalInfo.email && (
        <div className="flex items-center gap-2 break-all">
          <Mail className="w-3.5 h-3.5 shrink-0 opacity-80" />
          <span>{personalInfo.email}</span>
        </div>
      )}
      {personalInfo.phone && (
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 shrink-0 opacity-80" />
          <span>{personalInfo.phone}</span>
        </div>
      )}
      {Boolean(personalInfo.city?.trim() || personalInfo.country?.trim()) && (
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 shrink-0 opacity-80" />
          <span>
            {[personalInfo.city?.trim(), personalInfo.country?.trim()].filter(Boolean).join(', ')}
          </span>
        </div>
      )}
      {personalInfo.linkedin && (
        <div className="flex items-center gap-2 break-all">
          <Linkedin className="w-3.5 h-3.5 shrink-0 opacity-80" />
          <span>{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>
        </div>
      )}
      {personalInfo.website && (
        <div className="flex items-center gap-2 break-all">
          <Globe className="w-3.5 h-3.5 shrink-0 opacity-80" />
          <span>{personalInfo.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
        </div>
      )}
      {personalInfo.github && (
        <div className="flex items-center gap-2 break-all">
          <Github className="w-3.5 h-3.5 shrink-0 opacity-80" />
          <span>{personalInfo.github.replace(/^https?:\/\/(www\.)?/, '')}</span>
        </div>
      )}
    </div>
  );

  return (
    <div
      id={id}
      className={`a4-sheet bg-white text-slate-800 shadow-xl flex flex-row overflow-hidden relative ${fontFamilyClass}`}
      style={{ minHeight: '297mm', width: '210mm' }}
    >
      {/* LEFT SIDEBAR (35% width) */}
      <div
        className="w-[34%] shrink-0 text-white p-6 flex flex-col gap-6"
        style={{ backgroundColor: accentColor }}
      >
        {/* Photo */}
        {personalInfo.photoUrl && (
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/40 shadow-md bg-white/10">
              <img
                src={personalInfo.photoUrl}
                alt={`${personalInfo.firstName} ${personalInfo.lastName}`}
                className="w-full h-full object-cover"
                style={{ transform: `scale(${personalInfo.photoZoom || 1})` }}
              />
            </div>
          </div>
        )}

        {/* Contact info */}
        <div>
          <h3 className="text-xs uppercase font-bold tracking-wider mb-3 pb-1 border-b border-white/30 flex items-center gap-1.5">
            Contact
          </h3>
          {renderContact()}
        </div>

        {/* Skills (in sidebar if enabled) */}
        {isEnabled('skills') && skills && skills.length > 0 && (
          <div>
            <h3 className="text-xs uppercase font-bold tracking-wider mb-3 pb-1 border-b border-white/30 flex items-center gap-1.5">
              Compétences
            </h3>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {skills.map((skill) => (
                <span
                  key={skill.id}
                  className="inline-block bg-white/20 px-2 py-0.5 rounded text-[11px] font-medium"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {isEnabled('languages') && languages && languages.length > 0 && (
          <div>
            <h3 className="text-xs uppercase font-bold tracking-wider mb-3 pb-1 border-b border-white/30 flex items-center gap-1.5">
              Langues
            </h3>
            <div className="space-y-2 text-xs">
              {languages.map((lang) => (
                <div key={lang.id} className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold">{lang.language}</span>
                  <span className="text-[10px] opacity-90 bg-white/15 px-1.5 py-0.5 rounded">
                    {lang.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {isEnabled('interests') && interests && interests.length > 0 && (
          <div>
            <h3 className="text-xs uppercase font-bold tracking-wider mb-3 pb-1 border-b border-white/30 flex items-center gap-1.5">
              Centres d'intérêt
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {interests.map((interest) => (
                <span
                  key={interest.id}
                  className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full"
                >
                  {interest.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* References in sidebar if compact */}
        {isEnabled('references') && references && references.length > 0 && (
          <div>
            <h3 className="text-xs uppercase font-bold tracking-wider mb-3 pb-1 border-b border-white/30 flex items-center gap-1.5">
              Références
            </h3>
            <div className="space-y-2 text-[11px]">
              {references.map((ref) => (
                <div key={ref.id} className="bg-white/10 p-2 rounded">
                  <div className="font-bold">{ref.name}</div>
                  <div className="opacity-90 text-[10px]">{ref.role} : {ref.company}</div>
                  {ref.phone && <div className="text-[9px] opacity-80">{ref.phone}</div>}
                  {ref.email && <div className="text-[9px] opacity-80">{ref.email}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT MAIN CONTENT (66% width) */}
      <div className="w-[66%] p-7 flex flex-col gap-5">
        {/* Name and Title Header */}
        <div className="border-b pb-4 border-slate-200">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
            <span style={{ color: accentColor }}>{personalInfo.firstName}</span>{' '}
            <span>{personalInfo.lastName}</span>
          </h1>
          {personalInfo.title && (
            <h2 className="text-base font-semibold text-slate-600 mt-1 uppercase tracking-wide">
              {personalInfo.title}
            </h2>
          )}
        </div>

        {/* Render Main Sections in Order */}
        {sectionsOrder?.map((sectionKey) => {
          if (!isEnabled(sectionKey)) return null;

          // Profile / Summary
          if (sectionKey === 'profile' && profileSummary) {
            return (
              <div key="profile" className="space-y-1.5">
                <h3
                  className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 pb-1 border-b-2"
                  style={{ borderColor: accentColor, color: accentColor }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Profil Professionnel
                </h3>
                <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line text-justify">
                  {profileSummary}
                </p>
              </div>
            );
          }

          // Experiences
          if (sectionKey === 'experience' && experiences && experiences.length > 0) {
            return (
              <div key="experience" className="space-y-3">
                <h3
                  className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 pb-1 border-b-2"
                  style={{ borderColor: accentColor, color: accentColor }}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Expériences Professionnelles
                </h3>
                <div className="space-y-3">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="relative pl-3 border-l-2 border-slate-200 space-y-0.5">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-slate-900">{exp.title}</span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {exp.startDate} - {exp.current ? 'Présent' : exp.endDate || '-'}
                        </span>
                      </div>
                      <div className="text-[11px] font-medium" style={{ color: accentColor }}>
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
              <div key="education" className="space-y-3">
                <h3
                  className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 pb-1 border-b-2"
                  style={{ borderColor: accentColor, color: accentColor }}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  Formations & Diplômes
                </h3>
                <div className="space-y-2.5">
                  {educations.map((edu) => (
                    <div key={edu.id} className="relative pl-3 border-l-2 border-slate-200 space-y-0.5">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-slate-900">{edu.degree}</span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {edu.startDate} - {edu.current ? 'En cours' : edu.endDate || '-'}
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-700">
                        {edu.school} {edu.city ? `• ${edu.city}` : ''}
                      </div>
                      {edu.description && (
                        <p className="text-[10px] text-slate-600 italic mt-0.5">{edu.description}</p>
                      )}
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
                <h3
                  className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 pb-1 border-b-2"
                  style={{ borderColor: accentColor, color: accentColor }}
                >
                  <Award className="w-3.5 h-3.5" />
                  Certifications & Distinctions
                </h3>
                <div className="space-y-1.5">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="text-xs flex justify-between items-start">
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

          // Custom Sections
          if (sectionKey.startsWith('custom_')) {
            const customSec = customSections?.find((cs) => cs.key === sectionKey);
            if (!customSec || !customSec.items?.length) return null;

            return (
              <div key={sectionKey} className="space-y-2">
                <h3
                  className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 pb-1 border-b-2"
                  style={{ borderColor: accentColor, color: accentColor }}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  {customSec.title}
                </h3>
                <div className="space-y-2">
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
    </div>
  );
};
