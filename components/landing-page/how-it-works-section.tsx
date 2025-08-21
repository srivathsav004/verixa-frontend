"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function HowItWorksSection() {
  const [selectedPath, setSelectedPath] = useState<number | null>(null)

  const verificationPaths = [
    {
      title: "Template-Based Verification",
      description: "For standardized medical reports with pre-registered templates",
      steps: [
        "Medical issuer uploads document template",
        "AI analyzes template structure and validates format",
        "Document is cryptographically signed and stored on blockchain",
        "Verification provides instant trust score based on template match",
      ],
      color: "blue",
    },
    {
      title: "AI-Powered Analysis",
      description: "For custom reports requiring intelligent content analysis",
      steps: [
        "Document uploaded for comprehensive AI analysis",
        "Machine learning models analyze content, format, and metadata",
        "Cross-reference with medical databases and standards",
        "Generate detailed verification report with confidence metrics",
      ],
      color: "purple",
    },
  ]

  return (
    <section className="py-24 px-6 relative bg-gradient-to-b from-gray-900 to-black">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Two Verification Paths
          </h2>
          <p className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Choose the verification method that best fits your document type and requirements
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {verificationPaths.map((path, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card
                className={`p-8 h-full cursor-pointer transition-all duration-300 ${
                  selectedPath === index
                    ? `bg-${path.color}-900/30 border-${path.color}-500`
                    : "bg-gray-900/50 border-gray-800 hover:bg-gray-900/70"
                }`}
                onClick={() => setSelectedPath(selectedPath === index ? null : index)}
              >
                <h3 className="text-2xl font-bold mb-4 text-white">{path.title}</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">{path.description}</p>

                <Button
                  variant="outline"
                  className={`mb-6 ${
                    selectedPath === index
                      ? `border-${path.color}-500 text-${path.color}-400`
                      : "border-gray-600 text-gray-400"
                  }`}
                >
                  {selectedPath === index ? "Hide Details" : "View Process"}
                </Button>

                {selectedPath === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-4">
                      {path.steps.map((step, stepIndex) => (
                        <motion.div
                          key={stepIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: stepIndex * 0.1 }}
                          className="flex items-start space-x-3"
                        >
                          <div
                            className={`w-6 h-6 rounded-full bg-${path.color}-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5`}
                          >
                            {stepIndex + 1}
                          </div>
                          <p className="text-gray-300 leading-relaxed">{step}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Marquee-style animation showing the flow */}
        <motion.div
          className="relative overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-center mb-8 text-white">Verification Flow</h3>

          <div className="flex items-center justify-between space-x-4 overflow-x-auto">
            {["Upload", "Analyze", "Verify", "Score", "Report"].map((step, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center min-w-[120px]"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mb-3">
                  {index + 1}
                </div>
                <p className="text-gray-300 text-center font-medium">{step}</p>
                {index < 4 && (
                  <motion.div
                    className="absolute w-8 h-px bg-gradient-to-r from-blue-500 to-purple-600 mt-8"
                    style={{ left: `${(index + 1) * 20}%` }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 0.5, delay: (index + 1) * 0.2 }}
                    viewport={{ once: true }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
