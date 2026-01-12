export default function Home() {
  const time = new Date().getHours()
  const greeting = time < 12 ? "Good morning" : time < 18 ? "Good afternoon" : "Good evening"

  return (
    <div className="p-6 pt-12 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-4xl font-light tracking-tight text-white">{greeting}, Operator.</h1>
        <p className="text-muted-foreground text-lg">System nominal. 4 pending items.</p>
      </div>

      {/* Quick Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-card border border-border p-5 flex flex-col justify-between aspect-[4/3] active:scale-95 transition-transform">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="size-2 rounded-full bg-primary animate-pulse" />
          </div>
          <div>
            <div className="text-2xl font-medium text-white">12</div>
            <div className="text-sm text-muted-foreground">Inbox</div>
          </div>
        </div>
        <div className="rounded-2xl bg-card border border-border p-5 flex flex-col justify-between aspect-[4/3] active:scale-95 transition-transform">
          <div className="size-8 rounded-full bg-muted flex items-center justify-center">
             <div className="size-2 rounded-full bg-muted-foreground" />
          </div>
          <div>
            <div className="text-2xl font-medium text-white">3</div>
            <div className="text-sm text-muted-foreground">Tasks</div>
          </div>
        </div>
      </div>

      {/* Recent Activity / Feed */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Recent Activity</h2>
        <div className="space-y-3">
          {[
            { title: "System updated to v2.0", time: "2m ago", type: "system" },
            { title: "New note created: 'Project Alpha'", time: "1h ago", type: "note" },
            { title: "Task completed: 'Deploy to prod'", time: "3h ago", type: "task" },
          ].map((item, i) => (
            <div key={i} className="group flex items-center justify-between py-3 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-3">
                 <div className="size-1.5 rounded-full bg-primary" />
                 <span className="text-base font-light text-foreground group-hover:text-white transition-colors">{item.title}</span>
              </div>
              <span className="text-xs text-muted-foreground font-mono">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Action Button */}
      <button className="w-full rounded-full bg-primary py-4 text-primary-foreground font-medium text-lg active:scale-95 transition-transform">
        Initiate Sync
      </button>
    </div>
  )
}