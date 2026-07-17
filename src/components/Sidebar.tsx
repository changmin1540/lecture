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
    <div className="w-64 bg-slate-900 text-slate-300 h-screen flex flex-col border-r border-slate-800">
      <div className="p-6">
        <h1 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
          <div className="w-2 h-6 bg-blue-500 rounded-full" />
          Pyro-Data
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1 font-mono font-bold">
          Insight Engine v1.0
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
                "group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all",
                selectedProjectId === project.id 
                  ? "bg-blue-600/10 text-blue-400 ring-1 ring-blue-500/50" 
                  : "hover:bg-slate-800 text-slate-400"
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
            <div className="text-center py-8 text-slate-600">
              <p className="text-xs italic">No projects yet</p>
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
