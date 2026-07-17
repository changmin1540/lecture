/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Project } from '../types';
import { Plus, FolderOpen, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (id: string) => void;
  onAddProject: () => void;
  onDeleteProject: (id: string) => void;
}

export function Sidebar({ 
  projects, 
  selectedProjectId, 
  onSelectProject, 
  onAddProject,
  onDeleteProject 
}: SidebarProps) {
  return (
    <div className="w-64 bg-charcoal text-slate-300 h-screen flex flex-col border-r border-charcoal">
      <div className="p-6 border-b border-white/5">
        <h1 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
          <div className="w-2 h-6 bg-hanwha rounded-sm" />
          Hanwha <span className="font-light opacity-60">Pyro</span>
        </h1>
        <p className="text-[9px] uppercase tracking-[0.2em] text-hanwha mt-1 font-mono font-bold">
          Precision Insight Engine
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Projects</span>
          <button 
            onClick={onAddProject}
            className="p-1 hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-white"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="space-y-1">
          {projects.map((project) => (
            <div 
              key={project.id}
              className={cn(
                "group flex items-center justify-between px-3 py-2.5 rounded-sm cursor-pointer transition-all mx-2 mb-1",
                selectedProjectId === project.id 
                  ? "bg-hanwha text-white" 
                  : "hover:bg-white/5 text-slate-400"
              )}
              onClick={() => onSelectProject(project.id)}
            >
              <div className="flex items-center gap-3 truncate">
                <FolderOpen size={16} />
                <span className="text-sm font-medium truncate">{project.name}</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteProject(project.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          
          {projects.length === 0 && (
            <div className="text-center py-8 px-4">
              <p className="text-xs italic text-slate-600 mb-4">No projects yet</p>
              <button 
                onClick={onAddProject}
                className="w-full py-2 bg-white/5 border border-white/10 text-slate-300 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-white/10 transition-all mb-2"
              >
                Create New
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
            PG
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">PGM R&D Center</p>
            <p className="text-[10px] text-slate-500 truncate">Pyro-Dev Team</p>
          </div>
        </div>
      </div>
    </div>
  );
}
