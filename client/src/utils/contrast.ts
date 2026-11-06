/**
 * Utilitaires de contraste et de dérivation de couleurs pour iziCV.
 * Conforme WCAG 2.1 niveau AA (rapport minimal de 4,5:1).
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Convertit une couleur hexadécimale (#RGB, #RRGGBB) en composantes RGB.
 */
export function hexToRgb(hex: string): RGB {
  let clean = (hex || '').replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num) || clean.length !== 6) {
    return { r: 13, g: 148, b: 136 }; // #0d9488 par défaut
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Calcule la luminance relative d'une couleur selon la formule WCAG 2.1.
 */
export function getRelativeLuminance(rgb: RGB): number {
  const normalize = (val: number) => {
    const s = val / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const r = normalize(rgb.r);
  const g = normalize(rgb.g);
  const b = normalize(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calcule le rapport de contraste entre deux luminances (entre 1 et 21).
 */
export function getContrastRatio(lum1: number, lum2: number): number {
  const l1 = Math.max(lum1, lum2);
  const l2 = Math.min(lum1, lum2);
  return (l1 + 0.05) / (l2 + 0.05);
}

/**
 * Détermine la meilleure couleur de texte (blanc #ffffff ou noir ardoise #0f172a)
 * posée sur une couleur d'arrière-plan pour garantir un ratio >= 4,5:1.
 */
export function getContrastingTextColor(bgHex: string): {
  color: '#ffffff' | '#0f172a';
  ratio: number;
  isLightBg: boolean;
} {
  const bgRgb = hexToRgb(bgHex);
  const bgLum = getRelativeLuminance(bgRgb);

  // Luminance du blanc (#ffffff) = 1.0
  const whiteRatio = getContrastRatio(1.0, bgLum);
  // Luminance de #0f172a (ardoise très foncée) = environ 0.012
  const darkLum = getRelativeLuminance({ r: 15, g: 23, b: 42 });
  const darkRatio = getContrastRatio(darkLum, bgLum);

  if (whiteRatio >= 4.5) {
    return { color: '#ffffff', ratio: whiteRatio, isLightBg: false };
  } else if (darkRatio >= 4.5) {
    return { color: '#0f172a', ratio: darkRatio, isLightBg: true };
  } else {
    // Si aucun n'atteint strictement 4.5, on choisit le plus contrasté
    return whiteRatio >= darkRatio
      ? { color: '#ffffff', ratio: whiteRatio, isLightBg: false }
      : { color: '#0f172a', ratio: darkRatio, isLightBg: true };
  }
}

/**
 * Génère les styles de pastille (fond, texte, bordure) dérivés de la couleur d'accent.
 * Adapté selon que la pastille se trouve dans un bandeau coloré ou sur fond blanc.
 */
export function getDerivedPillStyles(
  accentHex: string,
  variant: 'onAccentBg' | 'onWhiteBg'
): {
  bg: string;
  color: string;
  border: string;
} {
  const rgb = hexToRgb(accentHex);
  const textInfo = getContrastingTextColor(accentHex);

  if (variant === 'onAccentBg') {
    // Dans la colonne latérale colorée du Modèle 1
    if (textInfo.isLightBg) {
      // Arrière-plan clair : texte sombre, pastille sombre semi-transparente
      return {
        bg: 'rgba(15, 23, 42, 0.10)',
        color: '#0f172a',
        border: 'rgba(15, 23, 42, 0.18)',
      };
    } else {
      // Arrière-plan foncé : texte blanc, pastille blanche semi-transparente
      return {
        bg: 'rgba(255, 255, 255, 0.20)',
        color: '#ffffff',
        border: 'rgba(255, 255, 255, 0.32)',
      };
    }
  } else {
    // Sur fond blanc (Modèle 2 ou contenu principal)
    const bg = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.10)`;
    const border = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`;

    // Vérifier si la couleur d'accent elle-même est assez contrastée sur fond blanc (lum=1.0)
    const accentLum = getRelativeLuminance(rgb);
    const contrastOnWhite = getContrastRatio(1.0, accentLum);

    // Si l'accent est assez sombre (>= 4.5), on l'utilise pour le texte. Sinon texte ardoise #0f172a.
    const color = contrastOnWhite >= 4.5 ? accentHex : '#0f172a';

    return { bg, color, border };
  }
}
