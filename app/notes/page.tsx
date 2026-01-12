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

export default function NotesPage() {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="p-6 pt-12 space-y-6"
    >
      <motion.div variants={item}>
        <h1 className="text-3xl font-light tracking-tight text-white">Notes</h1>
      </motion.div>
      <motion.div variants={container} className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <motion.div 
            key={i} 
            variants={item}
            whileTap={{ scale: 0.96 }}
            className="aspect-[3/4] rounded-xl border border-border bg-card p-4"
          >
            <div className="h-4 w-full rounded bg-muted/20 mb-2" />
            <div className="space-y-2">
              <div className="h-2 w-full rounded bg-muted/10" />
              <div className="h-2 w-4/5 rounded bg-muted/10" />
              <div className="h-2 w-3/5 rounded bg-muted/10" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}