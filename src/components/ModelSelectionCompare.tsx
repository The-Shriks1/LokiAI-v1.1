/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ModelCandidate } from '../types';
import { Check } from 'lucide-react';

interface ModelSelectionCompareProps {
  candidates: ModelCandidate[];
  selectedModelId: string | null;
  onSelect: (model: ModelCandidate) => void;
}

export const ModelSelectionCompare: React.FC<ModelSelectionCompareProps> = ({
  candidates,
  selectedModelId,
  onSelect,
}) => {
  return (
    <div className="w-full flex flex-col space-y-3 select-none">
      <p className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest font-bold">
        Ranked by fit for your device
      </p>

      <div className="flex flex-col divide-y divide-[#222225] border border-[#222225] rounded bg-[#18181b]/20">
        {candidates.map((model, idx) => {
          const isSelected = selectedModelId === model.id;
          return (
            <motion.div
              key={model.id}
              onClick={() => onSelect(model)}
              className={`flex items-center gap-3.5 px-3.5 py-3 cursor-pointer transition-colors duration-150 ${
                isSelected ? 'bg-[#2A4237]/15' : 'hover:bg-[#1e1e20]/40'
              }`}
              whileTap={{ scale: 0.995 }}
            >
              <span className="text-[11px] font-mono text-neutral-500 font-medium w-3 shrink-0">{idx + 1}</span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-[13.5px] font-sans font-medium text-brand-text truncate">{model.name}</h4>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#8da090] shrink-0" />}
                </div>
                <p className="text-[11px] text-neutral-500 leading-normal mt-0.5 line-clamp-1">
                  {model.description}
                </p>
              </div>

              <div className="text-right shrink-0 font-mono">
                <p className="text-[11px] text-brand-text font-bold">{model.size}</p>
                <p className="text-[9px] text-neutral-500">{model.speed}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-[11px] text-neutral-500 leading-relaxed">
        <strong className="text-brand-text">{candidates[0].name}</strong> fits your device's RAM budget with the best balance of speed and accuracy. Pick a row to compare, or continue with the top match.
      </p>
    </div>
  );
};
