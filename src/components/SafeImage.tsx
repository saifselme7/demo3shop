import { useEffect, useState, type ImgHTMLAttributes } from 'react';

interface SafeImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

/** Keeps remote/storage image failures inside the same quiet editorial geometry. */
export default function SafeImage({ alt = '', src, fallbackSrc, className = '', ...props }: SafeImageProps) {
  const [failed, setFailed] = useState(!src);
  useEffect(() => setFailed(!src), [src, fallbackSrc]);
  const activeSrc = failed ? fallbackSrc : src;

  if (!activeSrc) {
    return <div className={`image-fallback ${className}`} role={alt ? 'img' : undefined} aria-label={alt || undefined}><span aria-hidden="true">SAIF / FORM</span></div>;
  }

  return <img {...props} src={activeSrc} alt={alt} className={className} onError={() => setFailed(true)} />;
}
