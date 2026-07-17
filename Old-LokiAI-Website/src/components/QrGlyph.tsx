/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface QrGlyphProps {
  size?: number;
  className?: string;
  /** seed controls the pseudo-random module pattern so it stays stable across re-renders */
  seed?: number;
}

// Deterministic pseudo-random bit, not a scannable QR — a stylized module grid
// matching real QR structure (finder squares + quiet zone) for visual authenticity.
function bitAt(x: number, y: number, seed: number): boolean {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
  return (n - Math.floor(n)) > 0.5;
}

const GRID = 21;
const FINDER = 7;

export const QrGlyph: React.FC<QrGlyphProps> = ({ size = 120, className = '', seed = 8 }) => {
  const cell = size / GRID;

  const isFinderZone = (x: number, y: number) => {
    const inTopLeft = x < FINDER && y < FINDER;
    const inTopRight = x >= GRID - FINDER && y < FINDER;
    const inBottomLeft = x < FINDER && y >= GRID - FINDER;
    return inTopLeft || inTopRight || inBottomLeft;
  };

  const renderFinder = (ox: number, oy: number) => (
    <g key={`f-${ox}-${oy}`}>
      <rect x={ox * cell} y={oy * cell} width={FINDER * cell} height={FINDER * cell} fill="currentColor" opacity={0.9} />
      <rect x={(ox + 1) * cell} y={(oy + 1) * cell} width={(FINDER - 2) * cell} height={(FINDER - 2) * cell} fill="#000" />
      <rect x={(ox + 2) * cell} y={(oy + 2) * cell} width={(FINDER - 4) * cell} height={(FINDER - 4) * cell} fill="currentColor" />
    </g>
  );

  const modules: React.ReactNode[] = [];
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      if (isFinderZone(x, y)) continue;
      if (bitAt(x, y, seed)) {
        modules.push(
          <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill="currentColor" />
        );
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={className}
    >
      <rect x={0} y={0} width={size} height={size} fill="#000" />
      {modules}
      {renderFinder(0, 0)}
      {renderFinder(GRID - FINDER, 0)}
      {renderFinder(0, GRID - FINDER)}
    </svg>
  );
};
