function hashHue(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h) % 360; // 0..359
}

function hsl(h, s, l) {
  return `hsl(${h} ${s}% ${l}%)`;
}

export default function Avatar({ src, name = '', size = 56, bg, fg }) {
  const initials = (name || '?').trim().slice(0, 1).toUpperCase();
  const hue = hashHue(name);
  const autoBg = hsl(hue, 65, 50);
  const lightness = 50; // Lightness used above
  const autoFg = lightness > 60 ? '#111827' : '#ffffff';

  const wrapper = {
    width: size,
    height: size,
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'grid',
    placeItems: 'center',
    background: src ? 'transparent' : (bg || autoBg),
    color: fg || autoFg,
    fontWeight: 700,
    fontSize: Math.max(12, size * 0.4),
    border: '1px solid var(--border)'
  };

  const img = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: src ? 'block' : 'none'
  };

  return (
    <div style={wrapper}>
      {src ? <img src={src} alt={name} style={img} /> : initials}
    </div>
  );
}