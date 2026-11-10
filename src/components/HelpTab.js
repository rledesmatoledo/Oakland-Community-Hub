import help from '@/content/help.json'

// URLs in help.json that still start with "TODO" render as plain rows with
// "Link coming soon" instead of linking anywhere.
const isTodo = url => !url || url.startsWith('TODO')

function SectionHeading({ children, note }) {
  return (
    <div className="mt-8 mb-3">
      <h2 className="font-display font-bold text-xl text-ink tracking-[-0.01em]">{children}</h2>
      {note && <p className="text-sm text-muted mt-0.5">{note}</p>}
    </div>
  )
}

function CallCard({ card }) {
  const hasLink = card.link && !isTodo(card.link.url)
  // Web links open in a new tab; sms:/tel: links open the phone's app
  const isWeb = hasLink && /^https?:/.test(card.link.url)
  return (
    <div className="bg-surface border border-line rounded-xl flex flex-col">
      <a
        href={`tel:${card.tel}`}
        className="flex-1 p-4 min-h-24 flex flex-col justify-center"
        aria-label={`Call ${card.number}: ${card.label}`}
      >
        <span className={`font-display font-extrabold text-2xl tracking-[-0.02em] ${card.danger ? 'text-danger' : 'text-ink'}`}>
          {card.number}
        </span>
        <span className="text-sm text-muted mt-0.5">{card.label}</span>
      </a>
      {card.link && (
        hasLink ? (
          <a
            href={card.link.url}
            {...(isWeb && { target: '_blank', rel: 'noopener noreferrer' })}
            className="min-h-11 px-4 border-t border-line-soft flex items-center text-sm font-medium text-brand"
          >
            {card.link.label}
            {isWeb && <><span aria-hidden="true">&nbsp;↗</span><span className="sr-only"> (opens in a new tab)</span></>}
          </a>
        ) : (
          <span className="min-h-11 px-4 border-t border-line-soft flex items-center text-sm text-muted">
            {card.link.label}: link coming soon
          </span>
        )
      )}
    </div>
  )
}

function LinkRow({ row }) {
  const text = (
    <>
      <span className="block text-base font-medium text-ink">{row.title}</span>
      {row.description && <span className="block text-sm text-muted mt-0.5">{row.description}</span>}
    </>
  )
  if (isTodo(row.url)) {
    return (
      <div className="py-3 min-h-11 flex items-center justify-between gap-3">
        <div>{text}</div>
        <span className="text-sm text-muted flex-shrink-0">Link coming soon</span>
      </div>
    )
  }
  return (
    <a
      href={row.url}
      target="_blank"
      rel="noopener noreferrer"
      className="py-3 min-h-11 flex items-center justify-between gap-3"
    >
      <div>{text}</div>
      <span className="text-brand flex-shrink-0" aria-hidden="true">↗</span>
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  )
}

function LinkRows({ rows }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {rows.map(row => (
        <li key={row.title}><LinkRow row={row} /></li>
      ))}
    </ul>
  )
}

export default function HelpTab() {
  return (
    <div>
      <h1 className="font-display font-extrabold text-3xl text-ink tracking-[-0.02em]">{help.title}</h1>
      <p className="text-sm text-muted mt-1">{help.subtitle}</p>

      <SectionHeading>{help.reachNow.heading}</SectionHeading>
      <div className="grid grid-cols-2 gap-3">
        {help.reachNow.cards.map(card => <CallCard key={card.number} card={card} />)}
      </div>

      <SectionHeading>{help.everyday.heading}</SectionHeading>
      <LinkRows rows={help.everyday.rows} />

      <SectionHeading note={help.rights.note}>{help.rights.heading}</SectionHeading>
      <LinkRows rows={help.rights.rows} />
    </div>
  )
}
