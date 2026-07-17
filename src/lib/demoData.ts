/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, TestSession, DataPoint } from "../types";

const generateCurve = (maxP: number, peakTime: number, duration: number): DataPoint[] => {
  const points: DataPoint[] = [];
  for (let t = 0; t <= duration; t += 2) {
    // Simplified gamma-like distribution for pressure curve
    const p = maxP * Math.pow(t / peakTime, 2) * Math.exp(2 * (1 - t / peakTime));
    points.push({ t, p: Math.max(0, p) });
  }
  return points;
};

export const demoProject: Project = {
  id: "demo-project-id",
  name: "K-Model Alpha Development",
  createdBy: "System Demo",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const demoTests: TestSession[] = [
  {
    id: "demo-test-1",
    projectId: demoProject.id,
    ownerId: "demo-user",
    revision: "Rev.A",
    condition: "Ambient",
    researcher: "Lead Researcher Kim",
    testDate: new Date(Date.now() - 86400000 * 7).toISOString(),
    maxPressure: 1250,
    activationTime: 12,
    status: "Approved",
    curveData: generateCurve(1250, 15, 60),
    aiSummary: "Baseline performance achieved. Pressure rise rate matches theoretical model for Rev.A components.",
    isOutlier: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "demo-test-2",
    projectId: demoProject.id,
    ownerId: "demo-user",
    revision: "Rev.B",
    condition: "Ambient",
    researcher: "Lead Researcher Kim",
    testDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    maxPressure: 1380,
    activationTime: 10,
    status: "Approved",
    curveData: generateCurve(1380, 13, 60),
    aiSummary: "Revision B shows 10.4% increase in peak pressure and 16.7% faster activation. Performance is stable and exceeds design requirements.",
    isOutlier: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "demo-test-3",
    projectId: demoProject.id,
    ownerId: "demo-user",
    revision: "Rev.B",
    condition: "High",
    researcher: "Lead Researcher Kim",
    testDate: new Date(Date.now() - 86400000).toISOString(),
    maxPressure: 1520,
    activationTime: 8,
    status: "Flagged",
    curveData: generateCurve(1520, 11, 60),
    aiSummary: "Pressure spike detected under high-temperature conditions. Value is 21% higher than baseline, requiring verification of structural margins.",
    isOutlier: true,
    createdAt: new Date().toISOString()
  }
];
