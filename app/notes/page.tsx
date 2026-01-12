export default function NotesPage() {
  return (
    <div className="p-6 pt-12 space-y-6">
      <h1 className="text-3xl font-light tracking-tight text-white">Notes</h1>
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-[3/4] rounded-xl border border-border bg-card p-4 transition-transform active:scale-[0.98]">
            <div className="h-4 w-full rounded bg-muted/20 mb-2" />
            <div className="space-y-2">
              <div className="h-2 w-full rounded bg-muted/10" />
              <div className="h-2 w-4/5 rounded bg-muted/10" />
              <div className="h-2 w-3/5 rounded bg-muted/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
