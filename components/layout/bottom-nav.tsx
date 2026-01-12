"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Inbox, CheckSquare, FileText, MessageSquare } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const items = [
  { href: "/inbox", icon: Inbox, label: "Inbox" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/notes", icon: FileText, label: "Notes" },
  { href: "/chat", icon: MessageSquare, label: "Chat" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md">
      <nav className="flex h-20 items-center justify-around px-2 pb-4">
        {items.map((item) => {
          const isActive = item.href === "/" 
            ? pathname === "/"
            : pathname.startsWith(item.href)
          
          return (
            <Link key={item.href} href={item.href} className="flex flex-1 justify-center">
              <div className="relative flex items-center justify-center py-2">
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 rounded-2xl bg-accent"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30
                    }}
                  />
                )}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className={cn(
                    "relative z-10 flex items-center justify-center px-5 py-1.5 transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <item.icon strokeWidth={1.5} className="size-6" />
                </motion.div>
              </div>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
