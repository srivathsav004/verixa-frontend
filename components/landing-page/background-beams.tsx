"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface Beam {
  id: number
  left: number
  top: number
  width: number
  duration: number
  delay: number
}

export function BackgroundBeams() {
  const [beams, setBeams] = useState<Beam[]>([])

  useEffect(() => {
    // Generate beams only on client side
    const newBeams = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      width: 200 + Math.random() * 300,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    }))
    setBeams(newBeams)
  }, [])

  if (beams.length === 0) {
    // Return empty div during SSR and initial render
    return <div className="pointer-events-none absolute inset-0 overflow-hidden z-0" />
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {/* Animated beams */}
      {beams.map((beam) => (
        <motion.div
          key={beam.id}
          className="absolute h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"
          style={{
            left: `${beam.left}%`,
            top: `${beam.top}%`,
            width: `${beam.width}px`,
          }}
          initial={{
            opacity: 0,
            scaleX: 0,
          }}
          animate={{
            opacity: [0, 1, 0],
            scaleX: [0, 1, 0],
          }}
          transition={{
            duration: beam.duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: beam.delay,
          }}
        />
      ))}

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_60%,transparent_130%)]" />
    </div>
  )
}
