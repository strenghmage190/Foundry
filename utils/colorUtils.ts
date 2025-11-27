export function getContrastColor(hexColor: string): string {
    if (!hexColor || hexColor.length < 4) {
        return '#FFFFFF'; // Padrão para branco em caso de entrada inválida
    }
    
    let r_hex: string, g_hex: string, b_hex: string;

    if (hexColor.length === 4) { // Formato #RGB
        r_hex = hexColor[1] + hexColor[1];
        g_hex = hexColor[2] + hexColor[2];
        b_hex = hexColor[3] + hexColor[3];
    } else if (hexColor.length === 7) { // Formato #RRGGBB
        r_hex = hexColor.substring(1, 3);
        g_hex = hexColor.substring(3, 5);
        b_hex = hexColor.substring(5, 7);
    } else {
        return '#FFFFFF'; // Retorna branco se o formato for inesperado
    }

    const r = parseInt(r_hex, 16);
    const g = parseInt(g_hex, 16);
    const b = parseInt(b_hex, 16);

    // Fórmula de luminância YIQ
    const luminance = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    return (luminance >= 128) ? '#000000' : '#FFFFFF';
}

export function darkenColor(hexColor: string, percent: number): string {
    if (!hexColor || hexColor.length < 4) return '#000000';

    let f = parseInt(hexColor.slice(1), 16), 
        t = percent < 0 ? 0 : 255, 
        p = percent < 0 ? percent * -1 : percent, 
        R = f >> 16, 
        G = (f >> 8) & 0x00FF, 
        B = f & 0x0000FF;
        
    const newR = Math.round((t - R) * p) + R;
    const newG = Math.round((t - G) * p) + G;
    const newB = Math.round((t - B) * p) + B;

    const finalHex = (0x1000000 + newR * 0x10000 + newG * 0x100 + newB).toString(16).slice(1);
    
    return `#${finalHex}`;
}

export function hexToRgb(hex: string): string {
  if (!hex || hex.length < 4) return '156, 39, 176'; // default purple
  let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '156, 39, 176';
}

/**
 * Converte HEX para HSL (Hue, Saturation, Lightness)
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  if (!hex || hex.length < 4) return { h: 270, s: 50, l: 50 };
  
  let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 270, s: 50, l: 50 };

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    case b:
      h = ((r - g) / d + 4) / 6;
      break;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Converte HSL para HEX
 */
export function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Ajusta a saturação de uma cor em HEX
 * @param hex - Cor em HEX
 * @param saturation - Valor de saturação (0-100)
 */
export function adjustColorSaturation(hex: string, saturation: number): string {
  const hsl = hexToHsl(hex);
  hsl.s = Math.max(0, Math.min(100, saturation));
  return hslToHex(hsl.h, hsl.s, hsl.l);
}

/**
 * Ajusta o matiz (hue) de uma cor em HEX
 * @param hex - Cor em HEX
 * @param hueOffset - Deslocamento de matiz em graus (-360 a 360)
 */
export function adjustColorHue(hex: string, hueOffset: number): string {
  const hsl = hexToHsl(hex);
  hsl.h = (hsl.h + hueOffset + 360) % 360;
  return hslToHex(hsl.h, hsl.s, hsl.l);
}

/**
 * Gera uma cor inteligente baseada na luminância
 * Se a cor for muito escura ou clara, ajusta a saturação e matização para melhor legibilidade
 * @param hexColor - Cor em HEX
 */
export function generateSmartButtonColor(hexColor: string): string {
  if (!hexColor || hexColor.length < 4) return '#a978f8';

  // Calcula luminância
  let r_hex: string, g_hex: string, b_hex: string;
  if (hexColor.length === 4) {
    r_hex = hexColor[1] + hexColor[1];
    g_hex = hexColor[2] + hexColor[2];
    b_hex = hexColor[3] + hexColor[3];
  } else if (hexColor.length === 7) {
    r_hex = hexColor.substring(1, 3);
    g_hex = hexColor.substring(3, 5);
    b_hex = hexColor.substring(5, 7);
  } else {
    return '#a978f8';
  }

  const r = parseInt(r_hex, 16);
  const g = parseInt(g_hex, 16);
  const b = parseInt(b_hex, 16);
  const luminance = ((r * 299) + (g * 587) + (b * 114)) / 1000;

  let adjustedColor = hexColor;

  // Se muito escura (luminância < 50), aumenta a saturação e claridade
  if (luminance < 50) {
    const hsl = hexToHsl(hexColor);
    // Aumenta saturação para ficar mais vibrante
    const newSaturation = Math.min(100, hsl.s + 20);
    // Aumenta lightness para ficar menos escura
    const newLightness = Math.min(100, hsl.l + 20);
    adjustedColor = hslToHex(hsl.h, newSaturation, newLightness);
  }
  // Se muito clara (luminância > 200), diminui a claridade e pode ajustar saturação
  else if (luminance > 200) {
    const hsl = hexToHsl(hexColor);
    // Diminui lightness para ficar menos clara
    const newLightness = Math.max(0, hsl.l - 25);
    adjustedColor = hslToHex(hsl.h, hsl.s, newLightness);
  }

  return adjustedColor;
}

/**
 * Gera um contraste inteligente: retorna preto ou branco com ajuste automático
 * Para cores muito claras: retorna um cinza/preto para melhor contraste
 * Para cores muito escuras: retorna um branco brilhante
 * Para cores intermediárias: retorna branco normal
 * @param hexColor - Cor em HEX
 */
export function getIntelligentContrast(hexColor: string): string {
  if (!hexColor || hexColor.length < 4) {
    return '#FFFFFF';
  }

  let r_hex: string, g_hex: string, b_hex: string;

  if (hexColor.length === 4) {
    r_hex = hexColor[1] + hexColor[1];
    g_hex = hexColor[2] + hexColor[2];
    b_hex = hexColor[3] + hexColor[3];
  } else if (hexColor.length === 7) {
    r_hex = hexColor.substring(1, 3);
    g_hex = hexColor.substring(3, 5);
    b_hex = hexColor.substring(5, 7);
  } else {
    return '#FFFFFF';
  }

  const r = parseInt(r_hex, 16);
  const g = parseInt(g_hex, 16);
  const b = parseInt(b_hex, 16);

  // Fórmula de luminância YIQ
  const luminance = ((r * 299) + (g * 587) + (b * 114)) / 1000;

  if (luminance > 200) {
    // Cor muito clara: retorna preto/cinza escuro
    return '#1a1a1a';
  } else if (luminance < 50) {
    // Cor muito escura: retorna branco brilhante
    return '#FFFFFF';
  } else {
    // Cor intermediária: retorna branco normal
    return '#FFFFFF';
  }
}