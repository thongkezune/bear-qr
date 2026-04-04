"use client";

import { motion } from "framer-motion";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-be-vietnam text-xs tracking-[0.2em] uppercase text-zinc-500 font-medium">
        Ký Ức Số #128
      </span>
      <div className="font-be-vietnam font-bold tracking-widest uppercase text-sm text-primary">
        Step {currentStep} of {totalSteps}
      </div>
    </div>
  );
};
