"use client"

import { motion, Variants } from "framer-motion"

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30
    }
  }
}

export default function InboxPage() {
  const time = new Date().getHours()
  const greeting = time < 12 ? "Good morning" : time < 18 ? "Good afternoon" : "Good evening"

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="p-6 space-y-8"
    >
      {/* Header */}
      <motion.div variants={item} className="space-y-1">
        <h1 className="text-4xl font-light tracking-tight text-white">{greeting}, Operator.</h1>
        <p className="text-muted-foreground text-lg">System nominal. 4 pending items.</p>
      </motion.div>

      {/* Quick Status */}
      <motion.div variants={item} className="grid grid-cols-2 gap-4">
        <motion.div 
          variants={item}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          className="rounded-2xl bg-card border border-border p-5 flex flex-col justify-between aspect-[4/3] cursor-pointer"
        >
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="size-2 rounded-full bg-primary animate-pulse" />
          </div>
          <div>
            <div className="text-2xl font-medium text-white">12</div>
            <div className="text-sm text-muted-foreground">New Messages</div>
          </div>
        </motion.div>
        <motion.div 
          variants={item}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          className="rounded-2xl bg-card border border-border p-5 flex flex-col justify-between aspect-[4/3] cursor-pointer"
        >
          <div className="size-8 rounded-full bg-muted flex items-center justify-center">
             <div className="size-2 rounded-full bg-muted-foreground" />
          </div>
          <div>
            <div className="text-2xl font-medium text-white">3</div>
            <div className="text-sm text-muted-foreground">Pending Tasks</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Recent Activity / Feed */}
      <motion.div variants={item} className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Recent Activity</h2>
        <div className="space-y-3">
          {[
            { title: "System updated to v2.0", time: "2m ago", type: "system" },
            { title: "New note created: 'Project Alpha'", time: "1h ago", type: "note" },
            { title: "Task completed: 'Deploy to prod'", time: "3h ago", type: "task" },
          ].map((activity, i) => (
            <motion.div 
              key={i}
              variants={item}
              className="group flex items-center justify-between py-3 border-b border-border/50 last:border-0"
            >
              <div className="flex items-center gap-3">
                 <div className="size-1.5 rounded-full bg-primary" />
                 <span className="text-base font-light text-foreground group-hover:text-white transition-colors">{activity.title}</span>
              </div>
              <span className="text-xs text-muted-foreground font-mono">{activity.time}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Existing Inbox Items - Renamed to Incoming */}
      <motion.div variants={item} className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Incoming</h2>
        {[1, 2, 3].map((i) => (
          <motion.div 
            key={i} 
            variants={item}
            whileTap={{ scale: 0.95 }}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="h-4 w-2/3 rounded bg-muted/20 mb-2" />
            <div className="h-3 w-1/3 rounded bg-muted/10" />
          </motion.div>
        ))}
      </motion.div>
      
      {/* Action Button */}
      <motion.button 
        variants={item}
        whileTap={{ scale: 0.95 }}
        className="w-full rounded-full bg-primary py-4 text-primary-foreground font-medium text-lg"
      >
        Initiate Sync
      </motion.button>
    </motion.div>
  )
}
