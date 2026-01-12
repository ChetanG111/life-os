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

export default function TasksPage() {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="p-6 pt-12 space-y-6"
    >
      <motion.div variants={item}>
        <h1 className="text-3xl font-light tracking-tight text-white">Tasks</h1>
      </motion.div>
      <motion.div variants={item} className="h-px w-full bg-border" />
      <motion.div variants={container} className="space-y-2">
        {["Review system architecture", "Update dark mode palette", "Optimize motion primitives"].map((task, i) => (
          <motion.div 
            key={i} 
            variants={item}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
          >
            <div className="size-5 rounded-full border border-muted-foreground/30" />
            <span className="text-sm font-medium">{task}</span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}