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
  hidden: { opacity: 0, y: 20 },
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

export default function ChatPage() {
  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col p-4 pt-12">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-3xl font-light tracking-tight text-white px-2"
      >
        Chat
      </motion.h1>
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="flex-1 space-y-4 overflow-y-auto pb-4"
      >
        <motion.div variants={item} className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl bg-primary px-4 py-2 text-primary-foreground">
            <p className="text-sm">System status check.</p>
          </div>
        </motion.div>
        <motion.div variants={item} className="flex justify-start">
          <div className="max-w-[80%] rounded-2xl bg-muted px-4 py-2 text-foreground">
            <p className="text-sm">All systems nominal. Dark mode engaged.</p>
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative mt-auto"
      >
        <input 
          type="text" 
          placeholder="Enter command..." 
          className="w-full rounded-full border border-border bg-muted/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50"
        />
      </motion.div>
    </div>
  )
}