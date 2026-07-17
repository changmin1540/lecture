/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TestCondition = 'Ambient' | 'High' | 'Low';
export type TestStatus = 'Pending' | 'Approved' | 'Flagged';

export interface DataPoint {
  t: number; // Time in ms
  p: number; // Pressure in psi/bar
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestSession {
  id: string;
  projectId: string;
  revision: string;
  condition: TestCondition;
  researcher: string;
  testDate: string;
  maxPressure: number;
  activationTime: number;
  status: TestStatus;
  curveData: DataPoint[];
  aiSummary?: string;
  isOutlier?: boolean;
  materialSpecs?: {
    primaryCharge: string;
    primaryWeight: number; // mg
    secondaryCharge?: string;
    secondaryWeight?: number; // mg
    initiatorType: string;
  };
  createdAt: string;
  ownerId: string;
}

export interface ComparisonResult {
  deltaPressure: number; // %
  deltaActivation: number; // %
  summary: string;
}
