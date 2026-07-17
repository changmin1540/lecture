/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useRef } from 'react';
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
  const [exporting, setExporting] = React.useState(false);

  const chartData = useMemo(() => {
    if (selectedTests.length === 0) return [];

    // Find the max time across all tests to normalize X-axis
    const maxT = Math.max(...selectedTests.flatMap(t => t.curveData.map(d => d.t)));
    
    // Simple interpolation/merging for display
    // In a real app, we might need more sophisticated resampling
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

    return {
      deltaP,
      deltaT,
      current,
      previous
    };
  }, [selectedTests]);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#F8F9FA'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Pyro-Report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF Export failed:', err);
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

      <div ref={reportRef} className="space-y-6 p-1">
        {/* Graph Area */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-display font-bold text-slate-900 flex items-center gap-2">
              Pressure-Time Curve Overlay
            </h3>
            <div className="flex gap-2">
              {selectedTests.map((test, i) => (
                <div key={test.id} className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium">
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
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="t" 
                  label={{ value: 'Time (ms)', position: 'insideBottom', offset: -10, fontSize: 12 }} 
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                />
                <YAxis 
                  label={{ value: 'Pressure (psi)', angle: -90, position: 'insideLeft', fontSize: 12 }} 
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
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

      {/* Delta Analysis Table */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Max Pressure Analysis</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-display font-bold text-slate-900">{stats.current.maxPressure.toFixed(1)} <span className="text-lg font-normal text-slate-400">psi</span></p>
                <p className="text-xs text-slate-500 mt-1">Prev ({stats.previous.revision}): {stats.previous.maxPressure.toFixed(1)} psi</p>
              </div>
              <div className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold",
                stats.deltaP > 0 ? "text-hanwha bg-hanwha/10" : stats.deltaP < 0 ? "text-red-600 bg-red-50" : "text-slate-600 bg-slate-50"
              )}>
                {stats.deltaP > 0 ? <ArrowUpRight size={16} /> : stats.deltaP < 0 ? <ArrowDownRight size={16} /> : <Minus size={16} />}
                {Math.abs(stats.deltaP).toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Activation Time Analysis</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-display font-bold text-slate-900">{stats.current.activationTime.toFixed(1)} <span className="text-lg font-normal text-slate-400">ms</span></p>
                <p className="text-xs text-slate-500 mt-1">Prev ({stats.previous.revision}): {stats.previous.activationTime.toFixed(1)} ms</p>
              </div>
              <div className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold",
                stats.deltaT < 0 ? "text-emerald-600 bg-emerald-50" : stats.deltaT > 0 ? "text-amber-600 bg-amber-50" : "text-slate-600 bg-slate-50"
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
