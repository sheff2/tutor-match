export default function StarRating({ rating, maxStars = 5, size = 16, showNumber = true }) {
  const stars = [];
  const roundedRating = Math.round(rating * 10) / 10; // Round to nearest 0.1
  
  for (let i = 1; i <= maxStars; i++) {
    const diff = roundedRating - (i - 1);
    
    if (diff >= 1) {
      // Full star
      stars.push(
        <span key={i} style={{ color: '#f59e0b', fontSize: size, lineHeight: 1 }}>★</span>
      );
    } else if (diff > 0) {
      // Partial star - overlay method
      const percentage = Math.round(diff * 100);
      stars.push(
        <span 
          key={i} 
          style={{ 
            position: 'relative',
            display: 'inline-block',
            fontSize: size,
            lineHeight: 1,
          }}
        >
          {/* Background empty star */}
          <span style={{ color: '#cbd5e0' }}>★</span>
          {/* Foreground filled star clipped */}
          <span 
            style={{ 
              position: 'absolute',
              left: 0,
              top: 0,
              color: '#f59e0b',
              width: `${percentage}%`,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            ★
          </span>
        </span>
      );
    } else {
      // Empty star
      stars.push(
        <span key={i} style={{ color: '#cbd5e0', fontSize: size, lineHeight: 1 }}>★</span>
      );
    }
  }
  
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ display: 'inline-flex', letterSpacing: 1 }}>{stars}</span>
      {showNumber && rating > 0 && (
        <span style={{ fontSize: size * 0.875, color: '#4a5568', fontWeight: 500 }}>
          {roundedRating}
        </span>
      )}
    </span>
  );
}
