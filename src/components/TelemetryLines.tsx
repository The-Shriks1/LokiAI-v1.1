/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TelemetrySpec {
  id: string;
  label: string;
  metric: string;
}

interface TelemetryLinesProps {
  isVisible: boolean;
}

// Real fields synced over the WiFi pairing handshake after the QR scan — see docs/02_USER_JOURNEY.md
// Rendered as a plain in-flow chip row under the phone, not absolutely-positioned callout lines —
// that way it can never overlap the laptop or get clipped at odd viewport widths.
const SPECS: TelemetrySpec[] = [
  { id: 'model', label: 'MODEL', metric: 'Galaxy A12' },
  { id: 'cpu', label: 'CPU', metric: 'ARM64' },
  { id: 'ram', label: 'RAM', metric: '4 GB' },
  { id: 'storage', label: 'FREE', metric: '22 GB' },
];

export const TelemetryLines: React.FC<TelemetryLinesProps> = ({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="grid grid-cols-4 gap-1.5 w-[200px] sm:w-[220px] lg:w-[160px] xl:w-[190px] select-none"
        >
          {SPECS.map((spec, i) => (
            <motion.div
              key={spec.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 * i }}
              className="surface-card rounded px-1 py-1 flex flex-col items-center"
            >
              <span className="text-[7.5px] font-mono text-[#8da090] font-bold tracking-wider">{spec.label}</span>
              <span className="text-[8px] sm:text-[9.5px] font-bold text-neutral-300 leading-tight truncate w-full text-center">{spec.metric}</span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
