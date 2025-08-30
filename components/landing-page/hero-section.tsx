"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { BackgroundBeams } from "./background-beams"
import { HoverBorderGradient } from "./hover-border-gradient"
import Link from "next/link"
import Logo from "@/components/common/Logo"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <BackgroundBeams />

      {/* Top navigation with glass effect */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 z-20">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="pointer-events-auto flex items-center justify-between rounded-xl border border-white/10 bg-black/20 backdrop-blur supports-[backdrop-filter]:bg-black/10 px-4 py-2">
            <div className="flex items-center gap-2">
              <Logo size={22} className="text-white/90" />
              <span className="text-sm font-semibold tracking-wide text-white/80">Verixa</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="h-9 px-4 text-sm text-white/90 hover:text-white/100 hover:bg-white/10 border border-white/10"
                >
                  Log In
                </Button>
              </Link>
              <Link href="/role-selection">
                <Button className="h-9 px-4 text-sm font-semibold bg-white text-black hover:bg-gray-200">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <motion.h1
          className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Verixa
        </motion.h1>

        <motion.h2
          className="text-2xl md:text-3xl font-semibold mb-4 text-gray-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Medical Report Verification Made Simple
        </motion.h2>

        <motion.p
          className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Blockchain-powered verification system that eliminates medical document fraud in minutes, not days
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link href="/role-selection">
            <HoverBorderGradient>
              <Button size="lg" className="bg-white text-black hover:bg-gray-200 px-8 py-4 text-lg font-semibold">
                Get Started
              </Button>
            </HoverBorderGradient>
          </Link>

          <Link href="/demo">
            <Button
              size="lg"
              className="
                relative 
                border border-gray-600 
                text-white 
                bg-transparent 
                px-8 py-4 text-lg font-semibold 
                rounded-xl
                transition-all duration-300 ease-in-out 
                hover:border-white 
                hover:bg-white/10 
                hover:shadow-lg 
                hover:shadow-white/10
              "
            >
              Documentation
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
