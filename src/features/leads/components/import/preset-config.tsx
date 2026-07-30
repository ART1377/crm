// src/features/leads/components/import/preset-config.tsx

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Target } from 'lucide-react';

const PRESETS = {
  fast: {
    label: 'سریع',
    icon: Clock,
    radius: '1',
    step: '0.5',
    zoom: '17',
    description: '۱ کیلومتر، گام ۵۰۰ متر',
    color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
  },
  balanced: {
    label: 'متوازن',
    icon: Target,
    radius: '2',
    step: '0.25',
    zoom: '18',
    description: '۲ کیلومتر، گام ۲۵۰ متر',
    color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
  },
  complete: {
    label: 'کامل',
    icon: MapPin,
    radius: '3',
    step: '0.15',
    zoom: '19',
    description: '۳ کیلومتر، گام ۱۵۰ متر',
    color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
  },
} as const;

interface PresetConfigProps {
  onApply: (preset: { radius: string; step: string; zoom: string }) => void;
  currentRadius: string;
  currentStep: string;
  currentZoom: string;
}

export function PresetConfig({
  onApply,
  currentRadius,
  currentStep,
  currentZoom,
}: PresetConfigProps) {
  const isActive = (preset: (typeof PRESETS)[keyof typeof PRESETS]) =>
    preset.radius === currentRadius && preset.step === currentStep && preset.zoom === currentZoom;

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(PRESETS).map(([key, preset]) => {
        const Icon = preset.icon;
        const active = isActive(preset);
        return (
          <Button
            key={key}
            variant="outline"
            size="sm"
            onClick={() =>
              onApply({
                radius: preset.radius,
                step: preset.step,
                zoom: preset.zoom,
              })
            }
            className={`gap-2 px-3 py-1.5 text-xs ${
              active ? preset.color : 'border-muted hover:bg-muted/50 bg-white'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {preset.label}
            <Badge variant="secondary" className="h-5 text-[9px] font-normal">
              {preset.description}
            </Badge>
          </Button>
        );
      })}
    </div>
  );
}
