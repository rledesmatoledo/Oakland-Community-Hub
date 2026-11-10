import { Wordmark } from './OakLogo'

// Shared look for login, signup, forgot and reset (docs/design.md).
export const inputClass =
  'w-full h-12 bg-surface border border-field-border rounded-xl px-4 text-base text-ink placeholder:text-muted outline-none focus:border-brand'

export const primaryButtonClass =
  'w-full h-12 rounded-full bg-accent text-ink text-base font-semibold disabled:opacity-50'

export const linkClass = 'text-brand font-medium hover:underline'

export const helperClass = 'text-sm text-muted'

export function ErrorNotice({ children }) {
  return (
    <p role="alert" className="border-l-[3px] border-danger pl-3 text-base text-danger mb-4">
      {children}
    </p>
  )
}

export function SuccessNotice({ children }) {
  return (
    <p role="status" className="border-l-[3px] border-brand pl-3 text-base text-ink mb-4">
      {children}
    </p>
  )
}

export default function AuthShell({ title, subtitle, children }) {
  return (
    <main className="min-h-screen bg-canvas">
      <div className="max-w-md mx-auto px-4 py-8">
        <Wordmark />
        <h1 className="font-display font-extrabold text-3xl text-ink tracking-[-0.02em] leading-tight mt-10">
          {title}
        </h1>
        {subtitle && <p className="text-base text-muted mt-2">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </main>
  )
}
