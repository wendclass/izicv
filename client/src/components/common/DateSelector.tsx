import React from 'react';

interface DateSelectorProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholderPrefix?: string;
}

const MONTHS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS: string[] = [];
for (let y = CURRENT_YEAR + 3; y >= 1970; y--) {
  YEARS.push(y.toString());
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  value = '',
  onChange,
  disabled = false,
  placeholderPrefix = '',
}) => {
  // Parse month and year from value
  const parseValue = () => {
    if (!value) return { month: '', year: '' };
    const parts = value.trim().split(/[\s\/-]+/);
    let parsedMonth = '';
    let parsedYear = '';

    for (const part of parts) {
      // Check if matches month name
      const foundMonth = MONTHS.find((m) => m.toLowerCase().startsWith(part.toLowerCase().slice(0, 3)));
      if (foundMonth) {
        parsedMonth = foundMonth;
        continue;
      }
      // Check numeric month (01-12)
      if (/^(0?[1-9]|1[0-2])$/.test(part) && !parsedMonth) {
        const mIdx = parseInt(part, 10) - 1;
        if (MONTHS[mIdx]) parsedMonth = MONTHS[mIdx];
        continue;
      }
      // Check 4-digit year
      if (/^(19|20)\d{2}$/.test(part)) {
        parsedYear = part;
      }
    }

    return { month: parsedMonth, year: parsedYear };
  };

  const { month, year } = parseValue();

  const handleMonthChange = (newMonth: string) => {
    if (!newMonth && !year) {
      onChange('');
    } else if (newMonth && year) {
      onChange(`${newMonth} ${year}`);
    } else if (newMonth) {
      onChange(newMonth);
    } else {
      onChange(year);
    }
  };

  const handleYearChange = (newYear: string) => {
    if (!newYear && !month) {
      onChange('');
    } else if (month && newYear) {
      onChange(`${month} ${newYear}`);
    } else if (newYear) {
      onChange(newYear);
    } else {
      onChange(month);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-1.5">
      <select
        value={month}
        disabled={disabled}
        onChange={(e) => handleMonthChange(e.target.value)}
        className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400 text-slate-700"
      >
        <option value="">{placeholderPrefix ? `${placeholderPrefix} (Mois)` : 'Mois'}</option>
        {MONTHS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <select
        value={year}
        disabled={disabled}
        onChange={(e) => handleYearChange(e.target.value)}
        className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400 text-slate-700 font-medium"
      >
        <option value="">{placeholderPrefix ? `${placeholderPrefix} (Année)` : 'Année'}</option>
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
};
