/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ChapterID = 'landing' | 'hero' | 'pairing' | 'intent' | 'selection' | 'deployment' | 'independence' | 'download';

export interface DeviceSpec {
  id: string;
  label: string;
  value: string;
  unit?: string;
  x: number; // relative positions on the device UI for drawing pointer lines
  y: number;
  meta?: string;
}

export interface ModelCandidate {
  id: string;
  name: string;
  size: string;
  speed: string;
  fps: number;
  compatibility: 'OPTIMAL' | 'MODERATE' | 'LOW';
  accuracy: string;
  description: string;
}

export interface DeploymentStep {
  id: number;
  label: string;
  status: 'pending' | 'processing' | 'success';
  detail: string;
  progress: number;
}
