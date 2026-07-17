/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ComparisonView } from './components/ComparisonView';
import { UploadModal } from './components/UploadModal';
import { storage } from './lib/storage';
import { Project, TestSession } from './types';
import { 
  History, 
  Beaker, 
  Filter, 
  LayoutDashboard, 
  Plus,
  BrainCircuit,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [tests, setTests] = useState<TestSession[]>([]);
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [view, setView] = useState<'dashboard' | 'history'>('dashboard');

  useEffect(() => {
    const loadedProjects = storage.getProjects();
    setProjects(loadedProjects);
    if (loadedProjects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(loadedProjects[0].id);
    }
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      const projectTests = storage.getTests(selectedProjectId);
      setTests(projectTests);
      setSelectedTestIds([]); // Reset selection when project changes
    } else {
      setTests([]);
    }
  }, [selectedProjectId]);

  const handleAddProject = () => {
    const name = prompt('Project Name:');
    if (!name) return;

    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      createdBy: 'Researcher OOO',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.saveProject(newProject);
    setProjects([...projects, newProject]);
    setSelectedProjectId(newProject.id);
  };

  const handleDeleteProject = (id: string) => {
    if (!confirm('Are you sure you want to delete this project and all its data?')) return;
    storage.deleteProject(id);
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    if (selectedProjectId === id) {
      setSelectedProjectId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const toggleTestSelection = (id: string) => {
    setSelectedTestIds(prev => 
      prev.includes(id) 
        ? prev.filter(tid => tid !== id) 
        : [...prev, id]
    );
  };

  const handleUploadSuccess = (test: TestSession) => {
    storage.saveTest(test);
    setTests(prev => [test, ...prev]);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const testComparisonData = tests.filter(t => selectedTestIds.includes(t.id));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        projects={projects}
        selectedProjectId={selectedProjectId || ''}
        onSelectProject={setSelectedProjectId}
        onAddProject={handleAddProject}
        onDeleteProject={handleDeleteProject}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {selectedProject ? (
          <>
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-display font-bold text-slate-900">{selectedProject.name}</h2>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock size={12} />
                    Last updated {new Date(selectedProject.updatedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <CheckCircle size={12} className="text-emerald-500" />
                    {tests.length} Test Sessions
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button 
                    onClick={() => setView('dashboard')}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                      view === 'dashboard' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    <LayoutDashboard size={14} /> Dashboard
                  </button>
                  <button 
                    onClick={() => setView('history')}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                      view === 'history' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    <History size={14} /> History
                  </button>
                </div>
                <button 
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
                >
                  <Plus size={16} /> Import Data
                </button>
              </div>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <AnimatePresence mode="wait">
                {view === 'dashboard' ? (
                  <motion.div 
                    key="dashboard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    {/* Insights & Comparison */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                      <div className="xl:col-span-2">
                        <ComparisonView selectedTests={testComparisonData} />
                      </div>
                      
                      <div className="space-y-6">
                        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
                          <BrainCircuit size={80} className="absolute -right-4 -bottom-4 text-white/5" />
                          <h3 className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-4 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                            AI Insight Engine
                          </h3>
                          <div className="space-y-4">
                            {testComparisonData.length > 0 ? (
                              <div className="space-y-4">
                                {testComparisonData.map(test => (
                                  <div key={test.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase">{test.revision}</span>
                                      {test.isOutlier && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                                          <AlertTriangle size={10} /> Outlier Detected
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-slate-300 leading-relaxed italic">
                                      "{test.aiSummary || 'AI analysis pending or unavailable.'}"
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="py-12 text-center">
                                <p className="text-sm text-slate-400 italic">Select test sessions to generate AI comparative insights</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Recent Tests Mini List */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Select to Compare</h3>
                          <div className="space-y-2">
                            {tests.slice(0, 5).map(test => (
                              <div 
                                key={test.id}
                                onClick={() => toggleTestSelection(test.id)}
                                className={cn(
                                  "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                                  selectedTestIds.includes(test.id)
                                    ? "bg-blue-50 border-blue-200"
                                    : "bg-white border-slate-100 hover:border-slate-200"
                                )}
                              >
                                <div className={cn(
                                  "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                  selectedTestIds.includes(test.id) ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 bg-white"
                                )}>
                                  {selectedTestIds.includes(test.id) && <CheckCircle size={10} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold text-slate-900">{test.revision}</p>
                                    <span className={cn(
                                      "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                                      test.condition === 'Ambient' ? "bg-slate-100 text-slate-600" :
                                      test.condition === 'High' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                                    )}>
                                      {test.condition}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 mt-0.5">{test.maxPressure.toFixed(1)} psi • {test.activationTime.toFixed(1)} ms</p>
                                </div>
                              </div>
                            ))}
                            {tests.length > 5 && (
                              <button onClick={() => setView('history')} className="w-full py-2 text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest flex items-center justify-center gap-1">
                                View All <ArrowRight size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="history"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                  >
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Revision</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Condition</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Max Pressure</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Activation Time</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {tests.map(test => (
                          <tr key={test.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4 text-sm font-bold text-slate-900">{test.revision}</td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "text-[10px] px-2 py-1 rounded-full font-bold",
                                test.condition === 'Ambient' ? "bg-slate-100 text-slate-600" :
                                test.condition === 'High' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                              )}>
                                {test.condition}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-mono text-slate-600">{test.maxPressure.toFixed(2)} psi</td>
                            <td className="px-6 py-4 text-sm font-mono text-slate-600">{test.activationTime.toFixed(2)} ms</td>
                            <td className="px-6 py-4 text-xs text-slate-500">{new Date(test.testDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <span className={cn(
                                "flex items-center gap-1 text-[10px] font-bold",
                                test.isOutlier ? "text-amber-500" : "text-emerald-500"
                              )}>
                                {test.isOutlier ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                                {test.isOutlier ? 'Flagged' : 'Healthy'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {tests.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-6 py-24 text-center text-slate-400 italic">No test data imported yet</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white/50 backdrop-blur-sm">
            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/10">
              <Beaker size={48} />
            </div>
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Welcome to Pyro-Data Insight</h2>
            <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
              Select a project from the sidebar or create a new one to start analyzing pyro-device test data.
            </p>
            <button 
              onClick={handleAddProject}
              className="mt-8 px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
            >
              <Plus size={20} /> Create New Project
            </button>
          </div>
        )}
      </main>

      {isUploadModalOpen && selectedProjectId && (
        <UploadModal 
          projectId={selectedProjectId}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
