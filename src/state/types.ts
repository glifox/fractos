import type { LoroTreeNode } from "loro-crdt";

export enum Types {
  PROJECT = "Project",
  TASK = "Task",
}

export type ProjectData = {
  title: string,
  description: string,
};

const default_project_data: ProjectData = {
  title: "error",
  description: "error",
}

export function populateProject(node: LoroTreeNode, data: ProjectData) {
  for (const key of Object.keys(default_project_data)) {
    // @ts-ignore
    let value = data[key] || default_project_data[key];
    node.data.set(key,  value);
  }
}

export type TaskData = {
  title: string,
  description: string,
  percentage?: number,
}

const default_task_data: TaskData = {
  title: "error",
  description: "error",
  percentage: 0,
}

export function populateTask(node: LoroTreeNode, data: TaskData) {  
  for (const key of Object.keys(default_task_data)) {
    // @ts-ignore
    let value = data[key] || default_task_data[key];
    node.data.set(key,  value);
  }
}
