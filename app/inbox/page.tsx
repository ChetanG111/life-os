export default function InboxPage() {
  return (
    <div className="p-6 pt-12 space-y-6">
      <h1 className="text-3xl font-light tracking-tight text-white">Inbox</h1>
      <div className="h-px w-full bg-border" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 transition-transform active:scale-[0.98]">
            <div className="h-4 w-2/3 rounded bg-muted/20 mb-2" />
            <div className="h-3 w-1/3 rounded bg-muted/10" />
          </div>
        ))}
      </div>
    </div>
  )
}
