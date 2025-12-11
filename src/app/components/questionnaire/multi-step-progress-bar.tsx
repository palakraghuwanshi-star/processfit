'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check, type LucideIcon } from 'lucide-react';

interface Step {
  title: string;
  icon: LucideIcon;
}

interface MultiStepProgressBarProps {
  sections: readonly Step[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function MultiStepProgressBar({ sections, currentStep, onStepClick }: MultiStepProgressBarProps) {
  return (
    <div className="flex items-center justify-center">
      {sections.map((section, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <React.Fragment key={section.title}>
            <button
              type="button"
              onClick={() => onStepClick(index)}
              className={cn(
                'flex flex-col items-center text-center focus:outline-none rounded-md p-2 cursor-pointer'
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                  isCompleted ? 'border-primary bg-primary text-primary-foreground' : '',
                  isActive ? 'border-primary' : 'border-border',
                )}
              >
                {isCompleted ? (
                  <Check className="h-6 w-6" />
                ) : (
                  <section.icon
                    className={cn(
                      'h-6 w-6',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                )}
              </div>
              <p
                className={cn(
                  'mt-2 text-center text-sm font-medium',
                  isActive || isCompleted ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {section.title}
              </p>
            </button>
            {index < sections.length - 1 && (
              <div
                className={cn(
                  'mx-4 h-1 flex-1 rounded-full transition-colors',
                  isCompleted ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
