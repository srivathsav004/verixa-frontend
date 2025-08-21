"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

export function StatsSection() {
  return (
    <section className="py-24 px-6 relative bg-black">
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Trusted by the Best
          </h2>
          <p className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Our platform is trusted by thousands of providers and patients worldwide.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gray-900/50 border-gray-800 p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">50K+</div>
                <p className="text-gray-400">Documents Verified</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">1,200+</div>
                <p className="text-gray-400">Healthcare Providers</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">95%</div>
                <p className="text-gray-400">Fraud Detection Rate</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400 mb-2">2min</div>
                <p className="text-gray-400">Average Verification</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
