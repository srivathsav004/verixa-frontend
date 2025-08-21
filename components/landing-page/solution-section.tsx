"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

export function SolutionSection() {
  const steps = [
    {
      number: "01",
      title: "Upload Document",
      description: "Medical professionals upload reports directly to the blockchain",
      icon: "📄",
    },
    {
      number: "02",
      title: "AI Analysis + Blockchain Verification",
      description: "Advanced AI analyzes document authenticity while blockchain ensures immutability",
      icon: "🤖",
    },
    {
      number: "03",
      title: "Get Trust Score in Minutes",
      description: "Receive comprehensive verification results with confidence scores instantly",
      icon: "✅",
    },
  ]

  return (
    <section className="py-24 px-6 relative bg-gradient-to-b from-black to-gray-900">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            How Verixa Solves This
          </h2>
          <p className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Our three-step verification process transforms medical document authentication
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-8 h-full hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 group">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {step.number}
                </div>

                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">{step.icon}</div>

                <h3 className="text-2xl font-semibold mb-4 text-white">{step.title}</h3>

                <p className="text-gray-400 leading-relaxed">{step.description}</p>
              </Card>

              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-blue-500 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
