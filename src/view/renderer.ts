import type { TreeID } from "loro-crdt";
import type { Project } from "../state/project";
import type { Task } from "../state/tasks";
import type { Metadata, ProjectData, TaskData } from "../state/types";

type TaskElement = TaskData & {
  target: TreeID,
  parent: TreeID,
}

export interface FractosRenderer {
  createTask(element: TaskElement): void,
  createProject(element: ProjectData & { id: TreeID }): void,
  
  update(id: TreeID, metadata: Metadata): void,
  delete(id: TreeID): void,
  
  // reorderChilds(id: TreeID): HTMLElement,
  move(target: TreeID, parent?: TreeID): void,
}
