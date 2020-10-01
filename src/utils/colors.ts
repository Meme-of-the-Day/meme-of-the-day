interface Color {
  r: number;
  g: number;
  b: number;
};

function hexToRgb(hex: string): Color {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error('Not an RGB color value');
  }

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
}

export function getColorWithAlpha(hex: string, alpha: number) {
  const rgb: Color = hexToRgb(hex);

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}