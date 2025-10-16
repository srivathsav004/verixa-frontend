"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Timer, ShieldAlert, Hourglass } from "lucide-react"

export function ProblemSection() {
  return (
    <section className="py-24 px-6 relative">
      <div className="absolute inset-0 bg-dot-white/[0.2] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
            The Missing Link in Healthcare
          </h2>
          <p className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Currently, there's no standardized platform for medical document verification. Insurance companies struggle
            with manual processes, patients face delays, and fraud goes undetected.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Manual Verification",
              description: "Insurance companies spend weeks manually verifying medical documents",
              icon: <Timer className="w-10 h-10 text-red-400" aria-hidden />,
            },
            {
              title: "Document Fraud",
              description: "Billions lost annually due to fraudulent medical claims and reports",
              icon: <ShieldAlert className="w-10 h-10 text-orange-400" aria-hidden />,
            },
            {
              title: "Patient Delays",
              description: "Patients wait unnecessarily long for claim approvals and treatments",
              icon: <Hourglass className="w-10 h-10 text-yellow-400" aria-hidden />,
            },
          ].map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gray-900/50 border-gray-800 p-8 h-full hover:bg-gray-900/70 transition-colors group">
                <div className="mb-4 group-hover:scale-110 transition-transform">{problem.icon}</div>
                <h3 className="text-2xl font-semibold mb-4 text-white">{problem.title}</h3>
                <p className="text-gray-400 leading-relaxed">{problem.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

