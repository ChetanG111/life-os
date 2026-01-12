export default function ChatPage() {
  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col p-4 pt-12">
      <h1 className="mb-6 text-3xl font-light tracking-tight text-white px-2">Chat</h1>
      
      <div className="flex-1 space-y-4 overflow-y-auto pb-4">
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl bg-primary px-4 py-2 text-primary-foreground">
            <p className="text-sm">System status check.</p>
          </div>
        </div>
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-2xl bg-muted px-4 py-2 text-foreground">
            <p className="text-sm">All systems nominal. Dark mode engaged.</p>
          </div>
        </div>
      </div>

      <div className="relative mt-auto">
        <input 
          type="text" 
          placeholder="Enter command..." 
          className="w-full rounded-full border border-border bg-muted/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50"
        />
      </div>
    </div>
  )
}
