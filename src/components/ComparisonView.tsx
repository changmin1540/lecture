/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useRef, useState } from 'react';
import { TestSession } from '../types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Activity, ArrowUpRight, ArrowDownRight, Minus, FileDown, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface ComparisonViewProps {
  selectedTests: TestSession[];
}

export function ComparisonView({ selectedTests }: ComparisonViewProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const chartData = useMemo(() => {
    if (selectedTests.length === 0) return [];
    const allTimePoints = Array.from(new Set(selectedTests.flatMap(t => t.curveData.map(d => d.t)))).sort((a, b) => a - b);
    
    return allTimePoints.map(t => {
      const point: any = { t };
      selectedTests.forEach(test => {
        const found = test.curveData.find(d => d.t === t);
        if (found) {
          point[`${test.revision}_${test.condition}`] = found.p;
        }
      });
      return point;
    });
  }, [selectedTests]);

  const stats = useMemo(() => {
    if (selectedTests.length < 2) return null;
    const current = selectedTests[selectedTests.length - 1];
    const previous = selectedTests[selectedTests.length - 2];
    const deltaP = ((current.maxPressure - previous.maxPressure) / previous.maxPressure) * 100;
    const deltaT = ((current.activationTime - previous.activationTime) / previous.activationTime) * 100;
    return { deltaP, deltaT, current, previous };
  }, [selectedTests]);

  const handleExportPDF = async () => {
    const reportElement = reportRef.current;
    if (!reportElement) return;
    
    setExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#F8F9FA'
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`Pyro-Data-Insight-Report-${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error('PDF Export Error:', err);
    } finally {
      setExporting(false);
    }
  };

  if (selectedTests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-xl bg-white/50 text-slate-400">
        <Activity size={48} className="mb-4 opacity-20" />
        <p className="text-sm font-medium">Select tests from the list to compare performance</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={handleExportPDF}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-sm hover:bg-slate-800 transition-all disabled:opacity-50"
        >
          {exporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
          Export Report (PDF)
        </button>
      </div>

      <div ref={reportRef} className="space-y-6 p-4 bg-[#F8F9FA]">
        <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-display font-bold text-[#0F172A] flex items-center gap-2">
              Pressure-Time Curve Overlay
            </h3>
            <div className="flex gap-2">
              {selectedTests.map((test, i) => (
                <div key={test.id} className="flex items-center gap-2 px-3 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full text-xs font-medium text-[#475569]">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: ['#F37321', '#1C1C1C', '#0067B2', '#f59e0b'][i % 4] }} 
                  />
                  {test.revision} ({test.condition})
                </div>
              ))}
            </div>
          </div>
          
          <div className="h-[480px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis 
                  dataKey="t" 
                  label={{ value: 'Time (ms)', position: 'insideBottom', offset: -10, fontSize: 12, fill: '#64748B' }} 
                  fontSize={12}
                  tick={{ fill: '#64748B' }}
                />
                <YAxis 
                  label={{ value: 'Pressure (psi)', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#64748B' }} 
                  fontSize={12}
                  tick={{ fill: '#64748B' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="top" height={36}/>
                {selectedTests.map((test, i) => (
                  <Line
                    key={test.id}
                    type="monotone"
                    dataKey={`${test.revision}_${test.condition}`}
                    name={`${test.revision} (${test.condition})`}
                    stroke={['#F37321', '#1C1C1C', '#0067B2', '#f59e0b'][i % 4]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    animationDuration={800}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm">
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Max Pressure Analysis</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-display font-bold text-[#0F172A]">{stats.current.maxPressure.toFixed(1)} <span className="text-lg font-normal text-[#94A3B8]">psi</span></p>
                  <p className="text-xs text-[#64748B] mt-1">Prev ({stats.previous.revision}): {stats.previous.maxPressure.toFixed(1)} psi</p>
                </div>
                <div className={cn(
                  "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold",
                  stats.deltaP > 0 ? "text-[#F37321] bg-[#F373211A]" : stats.deltaP < 0 ? "text-[#DC2626] bg-[#FEF2F2]" : "text-[#475569] bg-[#F8FAFC]"
                )}>
                  {stats.deltaP > 0 ? <ArrowUpRight size={16} /> : stats.deltaP < 0 ? <ArrowDownRight size={16} /> : <Minus size={16} />}
                  {Math.abs(stats.deltaP).toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm">
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Activation Time Analysis</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-display font-bold text-[#0F172A]">{stats.current.activationTime.toFixed(1)} <span className="text-lg font-normal text-[#94A3B8]">ms</span></p>
                  <p className="text-xs text-[#64748B] mt-1">Prev ({stats.previous.revision}): {stats.previous.activationTime.toFixed(1)} ms</p>
                </div>
                <div className={cn(
                  "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold",
                  stats.deltaT < 0 ? "text-[#059669] bg-[#ECFDF5]" : stats.deltaT > 0 ? "text-[#D97706] bg-[#FFFBEB]" : "text-[#475569] bg-[#F8FAFC]"
                )}>
                  {stats.deltaT < 0 ? <ArrowDownRight size={16} /> : stats.deltaT > 0 ? <ArrowUpRight size={16} /> : <Minus size={16} />}
                  {Math.abs(stats.deltaT).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
