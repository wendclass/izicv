import React, { useState } from 'react';
import { SkillItem } from '../../../types/cv';
import { Plus, X, Wrench, Sparkles, Tag } from 'lucide-react';

interface SkillsFormProps {
  items: SkillItem[];
  onChange: (items: SkillItem[]) => void;
}

export const SkillsForm: React.FC<SkillsFormProps> = ({ items = [], onChange }) => {
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<number>(4);
  const [selectedCategory, setSelectedCategory] = useState<string>('Compétences clés');

  const defaultCategories = [
    'Compétences clés',
    'Compétences techniques',
    'Gestion & Stratégie',
    'Logiciels & Outils',
    'Soft Skills / Humaines',
  ];

  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSkillName.trim()) return;

    const newItem: SkillItem = {
      id: 'skill-' + Date.now(),
      name: newSkillName.trim(),
      level: newSkillLevel,
      category: selectedCategory,
    };

    onChange([...items, newItem]);
    setNewSkillName('');
  };

  const removeSkill = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const updateSkillLevel = (id: string, level: number) => {
    onChange(items.map((item) => (item.id === id ? { ...item, level } : item)));
  };

  // Group skills by category for clear presentation
  const groupedSkills = items.reduce((acc, skill) => {
    const cat = skill.category || 'Général';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {} as Record<string, SkillItem[]>);

  return (
    <div className="space-y-4">
      {/* Add New Skill Input Box */}
      <form onSubmit={handleAddSkill} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5 text-teal-600" />
          Ajouter une compétence
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2">
            <input
              type="text"
              placeholder="ex: Figma, React, Gestion de budget..."
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-700"
            >
              {defaultCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-600">Niveau :</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setNewSkillLevel(lvl)}
                  className={`w-5 h-5 rounded-full text-[10px] font-bold transition-all ${
                    newSkillLevel >= lvl
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!newSkillName.trim()}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter
          </button>
        </div>
      </form>

      {/* Display skills by categories */}
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">
          Aucune compétence ajoutée. Ajoutez vos savoir-faire ci-dessus.
        </p>
      ) : (
        <div className="space-y-3">
          {Object.entries(groupedSkills).map(([category, skills]) => (
            <div key={category} className="space-y-1.5">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3 h-3 text-teal-600" />
                {category}
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs shadow-2xs text-slate-800 group"
                  >
                    <span className="font-medium">{skill.name}</span>
                    {skill.level && (
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1 rounded">
                        {skill.level}/5
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
