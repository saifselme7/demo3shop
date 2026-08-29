import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface BaseProps {
  label: string;
  hint?: string;
  error?: string;
}

export default function Field({ label, hint, error, id, ...props }: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label htmlFor={id} className="field-wrap">
      <span className="field-label">{label}</span>
      <input id={id} {...props} className={`field-control ${error ? 'border-red-700' : ''} ${props.className ?? ''}`} />
      {hint ? <span className="field-hint">{hint}</span> : null}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}

export function TextareaField({ label, hint, error, id, ...props }: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label htmlFor={id} className="field-wrap">
      <span className="field-label">{label}</span>
      <textarea id={id} {...props} className={`field-control min-h-28 resize-y ${error ? 'border-red-700' : ''} ${props.className ?? ''}`} />
      {hint ? <span className="field-hint">{hint}</span> : null}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}
