/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import * as XLSX from 'xlsx';
import { DataPoint, TestCondition, TestSession } from '../types';

interface UploadModalProps {
  projectId: string;
  onClose: () => void;
  onSuccess: (test: TestSession) => void;
}

export function UploadModal({ projectId, onClose, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<Partial<TestSession> | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
      parseFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv']
    },
    multiple: false
  });

  const parseFile = async (file: File) => {
    setParsing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];

        // Expected format: { t: number, p: number } or columns "Time", "Pressure"
        const curveData: DataPoint[] = json.map(row => ({
          t: Number(row.t || row.Time || 0),
          p: Number(row.p || row.Pressure || 0)
        })).filter(d => !isNaN(d.t) && !isNaN(d.p));

        if (curveData.length === 0) throw new Error("Invalid format. Expected 't' and 'p' columns.");

        const maxPressure = Math.max(...curveData.map(d => d.p));
        const activationTime = curveData.find(d => d.p > maxPressure * 0.1)?.t || 0;

        setExtractedData({
          curveData,
          maxPressure,
          activationTime,
          revision: 'Rev.A', // Default
          condition: 'Ambient', // Default
          researcher: 'Current User',
          testDate: new Date().toISOString(),
          status: 'Pending'
        });
        setParsing(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      setError(err.message);
      setParsing(false);
    }
  };

  const handleSave = async () => {
    if (!extractedData || !file) return;
    
    setAnalyzing(true);
    try {
      // AI Analysis
      const res = await fetch('/api/analyze-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testData: extractedData })
      });
      const aiResult = await res.json();

      const newTest: TestSession = {
        id: crypto.randomUUID(),
        projectId,
        ownerId: 'default-user',
        createdAt: new Date().toISOString(),
        ...(extractedData as any),
        aiSummary: aiResult.summary,
        isOutlier: aiResult.isOutlier
      };

      onSuccess(newTest);
      onClose();
    } catch (err) {
      console.error("Analysis failed", err);
      // Still save even if AI fails, but without summary
      const newTest: TestSession = {
        id: crypto.randomUUID(),
        projectId,
        ownerId: 'default-user',
        createdAt: new Date().toISOString(),
        ...(extractedData as any)
      };
      onSuccess(newTest);
      onClose();
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900">Upload Test Data</h2>
            <p className="text-sm text-slate-500">Import Excel/CSV raw data from 계측기</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-8">
          {!file ? (
            <div 
              {...getRootProps()} 
              className={cn(
                "border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer",
                isDragActive ? "border-blue-500 bg-blue-50/50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <input {...getInputProps()} />
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload size={24} />
              </div>
              <p className="text-sm font-semibold text-slate-900">Drag & drop raw data file</p>
              <p className="text-xs text-slate-500 mt-1">Supports XLSX, CSV (Columns: t, p)</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                {parsing ? (
                  <Loader2 size={20} className="text-blue-600 animate-spin" />
                ) : (
                  <CheckCircle2 size={20} className="text-emerald-500" />
                )}
              </div>

              {extractedData && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Max Pressure</p>
                    <p className="text-xl font-display font-bold text-slate-900">{extractedData.maxPressure?.toFixed(2)} psi</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Activation Time</p>
                    <p className="text-xl font-display font-bold text-slate-900">{extractedData.activationTime?.toFixed(2)} ms</p>
                  </div>
                  <div className="col-span-2 space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Revision</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          value={extractedData.revision}
                          onChange={e => setExtractedData({...extractedData, revision: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Condition</label>
                        <select 
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          value={extractedData.condition}
                          onChange={e => setExtractedData({...extractedData, condition: e.target.value as TestCondition})}
                        >
                          <option value="Ambient">Ambient</option>
                          <option value="High">High</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-xs font-medium">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button 
            disabled={!extractedData || parsing || analyzing}
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                AI Analyzing...
              </>
            ) : (
              'Save & Analyze'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
