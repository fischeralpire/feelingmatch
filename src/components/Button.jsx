// Kleines Set an Button-Varianten, damit Seiten nicht jedes Mal Inline-Styles
// duplizieren. variant steuert nur die CSS-Klasse, siehe styles/components.css.
export default function Button({ variant = 'primary', className = '', ...props }) {
  const variantClass = {
    primary: 'fm-btn--primary',
    dark: 'fm-btn--dark',
    outline: 'fm-btn--outline',
    pill: 'fm-btn--pill',
    ghost: 'fm-btn--ghost',
    icon: 'fm-btn--icon',
  }[variant]

  return <button className={`fm-btn ${variantClass} ${className}`.trim()} {...props} />
}
