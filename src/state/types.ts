import type { LoroTreeNode } from "loro-crdt";

export enum Types {
  PROJECT = "Project",
  TASK = "Task",
}

export type ProjectData = {
  title: string,
  description: string,
};

export function populateProject(node: LoroTreeNode, data: ProjectData) {
  node.data.set("title", data.title);
  node.data.set("description", data.description);
}

export type TaskData = {
  title: string,
  description: string,
  percentage?: number,
}

export function populateTask(node: LoroTreeNode, data: TaskData) {  
  node.data.set("title", data.title);
  node.data.set("percentage", data.percentage! || 0);
  node.data.set("description", data.description);
}