"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function RolesSection() {
  const roles = [
    {
      title: "Medical Issuers",
      description: "Register, upload templates, issue verified reports",
      features: ["Digital signature integration", "Template management", "Batch processing", "Audit trails"],
      icon: "🏥",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Patients",
      description: "Receive reports, store securely, share instantly",
      features: ["Secure document wallet", "One-click sharing", "Privacy controls", "Mobile access"],
      icon: "👤",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      title: "Insurance Companies",
      description: "Verify reports, get trust scores, reduce fraud",
      features: ["Instant verification", "Fraud detection", "Risk assessment", "API integration"],
      icon: "🛡️",
      gradient: "from-purple-500 to-pink-500",
    },
  ]

  return (
    <section className="py-24 px-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Built for Three Key Players
          </h2>
          <p className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Verixa connects the entire healthcare ecosystem with secure, verified documentation
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, rotateY: -15 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{
                y: -10,
                rotateY: 5,
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
              className="perspective-1000"
            >
              <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700 p-8 h-full backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
                {/* Gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />

                <div className="relative z-10">
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    {role.icon}
                  </div>

                  <h3 className="text-3xl font-bold mb-4 text-white">{role.title}</h3>

                  <p className="text-gray-400 mb-6 leading-relaxed">{role.description}</p>

                  <ul className="space-y-3 mb-8">
                    {role.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-300">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${role.gradient} mr-3`} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full bg-gradient-to-r ${role.gradient} hover:opacity-90 text-white font-semibold`}
                  >
                    Learn More
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
