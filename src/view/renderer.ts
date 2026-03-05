import type { TreeID } from "loro-crdt";
import type { Project } from "../state/project";
import type { Task } from "../state/tasks";
import type { Metadata, ProjectData, TaskData } from "../state/types";

type TaskElement = TaskData & {
  target: TreeID,
  parent: TreeID,
}

type ProjectElement = ProjectData & {
  target: TreeID
}

export interface Renderer {
  createTask(element: TaskElement): HTMLElement,
  createProject(element: ProjectElement): HTMLElement,
  
  update(id: TreeID, metadata: Metadata): void,
  delete(id: TreeID): void,
  
  // reorderChilds(id: TreeID): HTMLElement,
  move(target: TreeID, parent?: TreeID): void,
}

export class SimpleRenderer implements Renderer {
  createTask(element: TaskElement): HTMLElement {
    throw new Error("Method not implemented.");
  }
  createProject(element: ProjectElement): HTMLElement {
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