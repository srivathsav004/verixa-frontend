"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const roles = [
  {
    title: "Document Issuer",
    description: "For hospitals, clinics, and labs issuing medical documents.",
    href: "/register/issuer",
  },
  {
    title: "Patient",
    description: "For individuals who need to verify and manage their medical records.",
    href: "/register/patient",
  },
  {
    title: "Insurance Provider",
    description: "For companies verifying claims and medical histories.",
    href: "/register/insurance",
  },
];

export function RoleSelection() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center">
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Choose Your Role
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-gray-400 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Select the option that best describes you to get started.
        </motion.p>
        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <Link href={role.href} key={role.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              >
                <Card className="bg-gray-900/50 border-gray-800 h-full text-left p-6 rounded-xl hover:border-blue-500 hover:bg-gray-900 transition-all duration-300 cursor-pointer group">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-white mb-2">{role.title}</CardTitle>
                    <CardDescription className="text-gray-400">{role.description}</CardDescription>
                  </CardHeader>
                  <div className="mt-4 flex justify-end items-center text-blue-400">
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                    <ArrowRight className="transform transition-transform group-hover:translate-x-1" />
                  </div>
                </Card>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
