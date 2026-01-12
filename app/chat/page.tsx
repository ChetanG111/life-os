"use client"

import { motion, Variants } from "framer-motion"
import { ArrowUp } from "lucide-react"

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

export default function ChatPage() {
  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col p-4">
      <motion.h1 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="mb-6 text-3xl font-light tracking-tight text-white px-2"
      >
        Chat
      </motion.h1>
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="flex-1 space-y-4 overflow-y-auto pb-4 scrollbar-hide"
      >
        {/* Placeholder for many messages to test scrolling */}
        {[...Array(10)].map((_, i) => (
          <motion.div key={i} variants={item} className={i % 2 === 0 ? "flex justify-end" : "flex justify-start"}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm font-medium ${
              i % 2 === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            }`}>
              <p>{i % 2 === 0 ? `Message ${i + 1} from Operator` : `Response ${i + 1} from System`}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Sticky Input Container */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.4 }}
        className="sticky bottom-0 bg-background pt-4 pb-2"
      >
        <div className="relative flex items-center">
          <input 
            type="text" 
            placeholder="Enter command..." 
            className="w-full rounded-full border border-border bg-muted/50 pl-4 pr-12 py-3 text-sm focus:border-primary focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50 transition-colors"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="absolute right-1.5 flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:bg-white hover:text-black"
          >
            <ArrowUp strokeWidth={2.5} className="size-5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}