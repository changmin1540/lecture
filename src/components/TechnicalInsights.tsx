/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TestSession } from '../types';
import { Database, FlaskConical, Code, ChevronRight, ChevronDown, Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface TechnicalInsightsProps {
  selectedTests: TestSession[];
}

export function TechnicalInsights({ selectedTests }: TechnicalInsightsProps) {
  const [activeTab, setActiveTab] = useState<'materials' | 'raw'>('materials');
  const [expandedTests, setExpandedTests] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedTests(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  if (selectedTests.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex border-b border-slate-100">
        <button
          onClick={() => setActiveTab('materials')}
          className={cn(
            "flex-1 px-6 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
            activeTab === 'materials' ? "bg-slate-50 text-hanwha border-b-2 border-hanwha" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <FlaskConical size={14} /> Material Specifications
        </button>
        <button
          onClick={() => setActiveTab('raw')}
          className={cn(
            "flex-1 px-6 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
            activeTab === 'raw' ? "bg-slate-50 text-hanwha border-b-2 border-hanwha" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <Code size={14} /> Technical Data Explorer
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'materials' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Test Revision</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Charge</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Primary (mg)</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secondary Charge</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Secondary (mg)</th>
                  <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Initiator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {selectedTests.map((test) => (
                  <tr key={test.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{test.revision}</span>
                        <span className="text-[10px] text-slate-500">{test.condition} Condition</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-xs text-slate-600">{test.materialSpecs?.primaryCharge || 'N/A'}</span>
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-xs font-mono font-bold text-hanwha">{test.materialSpecs?.primaryWeight || '0'}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-xs text-slate-600">{test.materialSpecs?.secondaryCharge || 'None'}</span>
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-xs font-mono font-bold text-hanwha">{test.materialSpecs?.secondaryWeight || '0'}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-xs text-slate-500 italic">{test.materialSpecs?.initiatorType || 'Standard'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg mb-6">
              <Info size={16} className="text-blue-500" />
              <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
                Visualizing the raw document structure for internal database synchronization and API payloads.
              </p>
            </div>
            {selectedTests.map((test) => (
              <div key={test.id} className="border border-slate-100 rounded-lg overflow-hidden">
                <button 
                  onClick={() => toggleExpand(test.id)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Database size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">{test.revision} - {test.id}</span>
                  </div>
                  {expandedTests.includes(test.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {expandedTests.includes(test.id) && (
                  <div className="p-4 bg-[#1e1e1e] overflow-x-auto max-h-[300px]">
                    <pre className="text-[11px] text-emerald-400 font-mono leading-relaxed">
                      {JSON.stringify(test, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
