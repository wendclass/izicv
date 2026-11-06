import React from 'react';

/**
 * Nettoie une URL pour l'affichage (retire https://, http://, www.)
 */
export function cleanUrl(url?: string): string {
  if (!url) return '';
  return url.trim().replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

/**
 * Formate une URL pour un lien <a> cliquable (ajoute https:// si manquant)
 */
export function formatUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Analyse une description textuelle (expérience, formation, projet)
 * et la transforme en vraie liste à puces (ul / li) avec retrait suspendu (Section 4.3).
 *
 * Supprime les puces manuelles (« • », « - », « * ») pour que le retrait
 * du texte passe sous la première lettre et jamais sous la puce.
 */
export function renderFormattedDescription(
  text?: string,
  options?: {
    className?: string;
    itemClassName?: string;
    bulletColor?: string;
  }
): React.ReactNode {
  if (!text || !text.trim()) return null;

  const rawLines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (rawLines.length === 0) return null;

  // Détecter si le texte est composé de lignes à puces ou de paragraphes
  const hasBulletsOrMultipleLines =
    rawLines.length > 1 ||
    rawLines.some((l) => /^[\s•\-\*\u2022\u2023\u25E6\u2043\u2219]+/.test(l));

  if (!hasBulletsOrMultipleLines) {
    // Paragraphe simple
    return (
      <p
        className={`leading-relaxed text-left whitespace-pre-line ${options?.className || ''}`}
        style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
      >
        {text}
      </p>
    );
  }

  // Traiter chaque ligne comme un élément de liste propre
  const cleanedItems = rawLines.map((line) => {
    // Supprimer tout symbole de puce en début de ligne
    return line.replace(/^[\s•\-\*\u2022\u2023\u25E6\u2043\u2219]+\s*/, '').trim();
  }).filter(Boolean);

  return (
    <ul
      className={`resume-bullet-list space-y-1 ${options?.className || ''}`}
      style={{
        listStyleType: 'disc',
        listStylePosition: 'outside',
        marginLeft: '1.25rem',
        paddingLeft: 0,
      }}
    >
      {cleanedItems.map((item, idx) => (
        <li
          key={idx}
          className={`leading-relaxed text-left ${options?.itemClassName || ''}`}
          style={{
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
            breakInside: 'avoid',
            pageBreakInside: 'avoid',
          }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
