export default function FieldError({ show, children }) {
  if (!show) return null
  return <div className="text-xs text-red-600">{children}</div>
}
