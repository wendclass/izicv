import React, { useState } from 'react';
import { Resume } from '../../types/cv';
import { getTemplateById } from '../../templates';
import {
  FileText,
  Edit,
  Copy,
  Trash2,
  Download,
  Calendar,
  MoreVertical,
  Check,
  Edit3,
} from 'lucide-react';

interface ResumeCardProps {
  resume: Resume;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onDownloadPDF: (resume: Resume) => void;
}

export const ResumeCard: React.FC<ResumeCardProps> = ({
  resume,
  onEdit,
  onDuplicate,
  onDelete,
  onRename,
  onDownloadPDF,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(resume.title);
  const [menuOpen, setMenuOpen] = useState(false);

  const template = getTemplateById(resume.templateId);
  const accentColor = resume.theme?.primaryColor || '#0d9488';

  const handleSaveTitle = () => {
    if (newTitle.trim() && newTitle !== resume.title) {
      onRename(resume.id, newTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const formattedDate = new Date(resume.updatedAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 hover:border-teal-500/50 hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group shadow-2xs">
      {/* Visual Header / Thumbnail Banner */}
      <div
        onClick={() => onEdit(resume.id)}
        className="h-36 bg-gradient-to-br from-slate-100 to-slate-50 border-b border-slate-100 p-4 flex flex-col justify-between relative cursor-pointer overflow-hidden"
      >
        {/* Accent Bar at top */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5 transition-all group-hover:h-2"
          style={{ backgroundColor: accentColor }}
        />

        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white shadow-2xs text-slate-700 border border-slate-200/80">
            {template.name.split('—')[0]}
          </span>
          <span
            className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
            style={{ backgroundColor: accentColor }}
            title={`Couleur : ${accentColor}`}
          />
        </div>

        {/* Visual Mini Resume Representation */}
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/50 shadow-2xs">
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">
              {resume.data?.personalInfo?.firstName || ''} {resume.data?.personalInfo?.lastName || 'CV'}
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              {resume.data?.personalInfo?.title || 'Sans titre'}
            </p>
          </div>
        </div>
      </div>

      {/* Card Content & Details */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          {isEditingTitle ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                className="w-full text-xs font-bold text-slate-900 border-b border-teal-500 px-1 py-0.5 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleSaveTitle}
                className="p-1 text-teal-600 hover:text-teal-700"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between group/title">
              <h3
                onClick={() => onEdit(resume.id)}
                className="text-sm font-bold text-slate-900 hover:text-teal-700 cursor-pointer truncate"
              >
                {resume.title}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingTitle(true)}
                className="opacity-0 group-hover/title:opacity-100 p-1 text-slate-400 hover:text-slate-600 transition-opacity"
                title="Renommer"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Calendar className="w-3 h-3" />
            <span>Modifié le {formattedDate}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
          <button
            type="button"
            onClick={() => onEdit(resume.id)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Modifier</span>
          </button>

          <button
            type="button"
            onClick={() => onDownloadPDF(resume)}
            title="Télécharger le PDF"
            className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDuplicate(resume.id)}
            title="Dupliquer le CV"
            className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(resume.id)}
            title="Supprimer le CV"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
