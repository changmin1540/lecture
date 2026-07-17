/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';

interface ProjectModalProps {
  onClose: () => void;
  onSave: (name: string) => void;
}

export function ProjectModal({ onClose, onSave }: ProjectModalProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-hanwha/10 text-hanwha rounded-sm">
              <FolderPlus size={20} />
            </div>
            <h2 className="text-xl font-display font-bold text-slate-900">New Project</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Project Name</label>
              <input 
                autoFocus
                type="text"
                placeholder="e.g. K-Model X Development"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:ring-2 focus:ring-hanwha outline-none transition-all"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!name.trim()}
              className="px-6 py-2 bg-hanwha text-white text-sm font-bold rounded-sm hover:bg-[#e66a1a] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
