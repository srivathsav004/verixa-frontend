"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

export function GlobeSection() {
  return (
    <section className="py-24 px-6 relative bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Global Healthcare Verification Network
          </h2>
          <p className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Join thousands of healthcare providers, patients, and insurance companies worldwide
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Globe visualization */}
            <div className="relative w-full h-96 bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />

              {/* Animated dots representing global network */}
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-blue-400 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: Math.random() * 2,
                  }}
                />
              ))}

              {/* Connection lines */}
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                  style={{
                    left: `${Math.random() * 50}%`,
                    top: `${Math.random() * 100}%`,
                    width: `${100 + Math.random() * 200}px`,
                    transform: `rotate(${Math.random() * 360}deg)`,
                  }}
                  animate={{
                    opacity: [0, 0.6, 0],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: Math.random() * 3,
                  }}
                />
              ))}

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-4">🌍</div>
                  <p className="text-blue-400 font-semibold">Global Network</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <h3 className="text-2xl font-bold text-white mb-4">Network Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">50K+</div>
                  <p className="text-gray-400">Documents Verified</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">1,200+</div>
                  <p className="text-gray-400">Healthcare Providers</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">95%</div>
                  <p className="text-gray-400">Fraud Detection Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">2min</div>
                  <p className="text-gray-400">Average Verification</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Supported Regions</h3>
              <div className="space-y-3">
                {["North America", "Europe", "Asia Pacific", "Latin America"].map((region, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-300">{region}</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
