"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

export function Stepper({ steps, currentStep, onStepClick, className }: StepperProps) {
  return (
    <div className={cn("flex items-center justify-center w-full", className)}>
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 cursor-pointer",
                {
                  "bg-blue-600 border-blue-600 text-white": index < currentStep,
                  "bg-blue-600 border-blue-600 text-white": index === currentStep,
                  "bg-gray-800 border-gray-600 text-gray-400": index > currentStep,
                }
              )}
              onClick={() => onStepClick?.(index)}
            >
              {index < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <div className="ml-3">
              <p
                className={cn(
                  "text-sm font-medium transition-colors duration-200",
                  {
                    "text-blue-400": index <= currentStep,
                    "text-gray-500": index > currentStep,
                  }
                )}
              >
                {step}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-16 h-0.5 mx-4 transition-colors duration-200",
                  {
                    "bg-blue-600": index < currentStep,
                    "bg-gray-600": index >= currentStep,
                  }
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 