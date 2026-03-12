import type { TreeID } from "loro-crdt";
import type { TaskData, ProjectData, Metadata } from "../../src/state/types";
import type { FractosRenderer } from "../../src/view/renderer";
import { HProject } from "./components/project";
import { Salty } from "./salty";
import type { FractosState } from "../../src/state/_state";


export class HtmlRenderer implements FractosRenderer {
  private saler: { salt: string, length: number };
  projects: WeakMap<Element, HProject> = new WeakMap();
  
  constructor(
    private parent: HTMLElement,
    private state: FractosState,
  ) {
    this.saler = Salty.new()
  }
  
  createTask(element: TaskData & { target: TreeID; parent: TreeID; }) { }
  
  createProject(element: ProjectData & { id: TreeID; }) {
    const pr = new HProject(element, element.id);
    this.projects.set(pr.elementDOM, pr);
    this.parent.appendChild(pr.elementDOM);
  }
  
  update(id: TreeID, metadata: Metadata): void {
    // throw new Error("Method not implemented.");
  }
  
  delete(id: TreeID): void {
    // throw new Error("Method not implemented.");
  }
  
  move(target: TreeID, parent?: TreeID): void {
    // throw new Error("Method not implemented.");
  }
}
