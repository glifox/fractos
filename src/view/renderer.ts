import type { TreeID } from "loro-crdt";
import type { Project } from "../state/project";
import type { Task } from "../state/tasks";
import type { Metadata } from "../state/types";

export interface Renderer {
  createTask(node: Task): HTMLElement,
  createProject(node: Project): HTMLElement,
  
  update(id: TreeID, metadata: Metadata): void,
  delete(id: TreeID): void,
  
  // reorderChilds(id: TreeID): HTMLElement,
  move(target: TreeID, parent?: TreeID): void,
}

export class SimpleRenderer implements Renderer {
  createTask(node: Task): HTMLElement {
    throw new Error("Method not implemented.");
  }
  createProject(node: Project): HTMLElement {
    throw new Error("Method not implemented.");
  }
  update(id: TreeID, metadata: Metadata): void {
    throw new Error("Method not implemented.");
  }
  delete(id: TreeID): void {
    throw new Error("Method not implemented.");
  }
  move(target: TreeID, parent?: TreeID): void {
    throw new Error("Method not implemented.");
  }
}