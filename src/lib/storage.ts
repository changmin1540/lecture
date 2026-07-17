/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, TestSession } from "../types";

const PROJECTS_KEY = "pyro_projects";
const TESTS_KEY = "pyro_tests";

export const storage = {
  getProjects: (): Project[] => {
    const data = localStorage.getItem(PROJECTS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  saveProject: (project: Project) => {
    const projects = storage.getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    if (index > -1) {
      projects[index] = project;
    } else {
      projects.push(project);
    }
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  },

  getTests: (projectId: string): TestSession[] => {
    const data = localStorage.getItem(TESTS_KEY);
    const allTests: TestSession[] = data ? JSON.parse(data) : [];
    return allTests.filter(t => t.projectId === projectId);
  },

  saveTest: (test: TestSession) => {
    const data = localStorage.getItem(TESTS_KEY);
    let allTests: TestSession[] = data ? JSON.parse(data) : [];
    const index = allTests.findIndex(t => t.id === test.id);
    if (index > -1) {
      allTests[index] = test;
    } else {
      allTests.push(test);
    }
    localStorage.setItem(TESTS_KEY, JSON.stringify(allTests));
  },

  deleteProject: (id: string) => {
    const projects = storage.getProjects().filter(p => p.id !== id);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
    
    // Cleanup tests
    const data = localStorage.getItem(TESTS_KEY);
    const allTests: TestSession[] = data ? JSON.parse(data) : [];
    const filteredTests = allTests.filter(t => t.projectId !== id);
    localStorage.setItem(TESTS_KEY, JSON.stringify(filteredTests));
  }
};
