import React, { useState } from 'react';
import { SkillItem } from '../../../types/cv';
import { Plus, X, Wrench, Tag, ChevronUp, ChevronDown } from 'lucide-react';

interface SkillsFormProps {
  items: SkillItem[];
  onChange: (items: SkillItem[]) => void;
}

export const SkillsForm: React.FC<SkillsFormProps> = ({ items = [], onChange }) => {
  const [newSkillName, setNewSkillName] = useState('');
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
      category: selectedCategory,
    };

    onChange([...items, newItem]);
    setNewSkillName('');
  };

  const removeSkill = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const moveSkill = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    onChange(newItems);
  };

  // Group skills by category for presentation
  const groupedSkills = items.reduce((acc, skill) => {
    const cat = skill.category || 'Compétences clés';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {} as Record<string, SkillItem[]>);

  return (
    <div className="space-y-4">
      {/* Add New Skill Input Box */}
      <form onSubmit={handleAddSkill} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Wrench className="w-4 h-4 text-teal-600" />
          Ajouter une compétence
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2">
            <input
              type="text"
              autoCapitalize="words"
              placeholder="ex: Figma, React, Gestion de budget..."
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-slate-700"
            >
              {defaultCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={!newSkillName.trim()}
          className="w-full min-h-[48px] py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Ajouter la compétence
        </button>
      </form>

      {/* Display skills by categories */}
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">
          Aucune compétence ajoutée. Ajoute tes savoir-faire ci-dessus.
        </p>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedSkills).map(([category, skills]) => (
            <div key={category} className="space-y-2">
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-teal-600" />
                {category}
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => {
                  const itemIndex = items.findIndex((it) => it.id === skill.id);
                  return (
                    <div
                      key={skill.id}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs shadow-2xs text-slate-800"
                    >
                      <span className="font-semibold">{skill.name}</span>

                      {/* Reorder Up/Down */}
                      <div className="flex items-center gap-0.5 ml-1 border-l border-slate-200 pl-1.5">
                        <button
                          type="button"
                          disabled={itemIndex <= 0}
                          onClick={() => moveSkill(itemIndex, 'up')}
                          aria-label={`Monter la compétence ${skill.name}`}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={itemIndex >= items.length - 1}
                          onClick={() => moveSkill(itemIndex, 'down')}
                          aria-label={`Descendre la compétence ${skill.name}`}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSkill(skill.id)}
                          aria-label={`Supprimer la compétence ${skill.name}`}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors ml-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
