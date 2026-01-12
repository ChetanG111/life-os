export default function TasksPage() {
  return (
    <div className="p-6 pt-12 space-y-6">
      <h1 className="text-3xl font-light tracking-tight text-white">Tasks</h1>
      <div className="h-px w-full bg-border" />
      <div className="space-y-2">
        {["Review system architecture", "Update dark mode palette", "Optimize motion primitives"].map((task, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-transform active:scale-[0.98]">
            <div className="size-5 rounded-full border border-muted-foreground/30" />
            <span className="text-sm font-medium">{task}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
