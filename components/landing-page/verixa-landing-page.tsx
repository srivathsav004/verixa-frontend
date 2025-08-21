"use client"
import { HeroSection } from "./hero-section"
import { ProblemSection } from "./problem-section"
import { SolutionSection } from "./solution-section"
import { RolesSection } from "./roles-section"
import { HowItWorksSection } from "./how-it-works-section"
import { StatsSection } from "./stats-section"
import { FooterSection } from "./footer-section"

export function VerixaLandingPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <RolesSection />
      <HowItWorksSection />
      <StatsSection />
      <FooterSection />
    </div>
  )
}
