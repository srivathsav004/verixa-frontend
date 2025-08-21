"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface HoverBorderGradientProps {
  children: ReactNode
}

export function HoverBorderGradient({ children }: HoverBorderGradientProps) {
  return (
    <motion.div
      className="relative group"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-0 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
      <div className="relative">{children}</div>
    </motion.div>
  )
}
