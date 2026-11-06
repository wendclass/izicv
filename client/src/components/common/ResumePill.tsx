import React from 'react';

interface ResumePillProps {
  children: React.ReactNode;
  bg?: string;
  color?: string;
  border?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Composant de pastille unique et robuste (Section 4.2).
 * - display: inline-flex avec align-items: center et line-height: 1.25
 * - border-radius fixe à 3mm (harmonieux même sur 2 lignes)
 * - box-decoration-break: clone pour que le fond suive les retours à la ligne
 * - break-inside: avoid pour empêcher toute coupure en saut de page
 * - overflow-wrap: anywhere pour supporter les libellés longs sans déformer la pastille
 */
export const ResumePill: React.FC<ResumePillProps> = ({
  children,
  bg,
  color,
  border,
  className = '',
  style,
}) => {
  return (
    <span
      className={`resume-pill inline-flex items-center text-left ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        lineHeight: 1.25,
        padding: '1.2mm 2.8mm',
        borderRadius: '3mm',
        WebkitBoxDecorationBreak: 'clone',
        boxDecorationBreak: 'clone',
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
        overflowWrap: 'anywhere',
        wordBreak: 'break-word',
        backgroundColor: bg,
        color: color,
        border: border ? `1px solid ${border}` : 'none',
        fontSize: '11px',
        fontWeight: 500,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

interface ResumePillContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Conteneur unifié pour les pastilles : display: flex; flex-wrap: wrap; gap: 2mm
 */
export const ResumePillContainer: React.FC<ResumePillContainerProps> = ({
  children,
  className = '',
  style,
}) => {
  return (
    <div
      className={`resume-pill-container flex flex-wrap ${className}`}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2mm',
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
