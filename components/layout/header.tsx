"use client"

import Image from "next/image"
import { motion } from "framer-motion"

export function Header() {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md"
    >
      <div className="flex items-center gap-2">
        <Image 
          src="/logo.png" 
          alt="Life OS Logo" 
          width={32} 
          height={32} 
          className="rounded-full brightness-0 invert"
        />
        <span className="text-sm font-medium uppercase tracking-[0.2em] text-white">Life OS</span>
      </div>
      <div className="size-2 rounded-full bg-primary animate-pulse" />
    </motion.header>
  )
}
