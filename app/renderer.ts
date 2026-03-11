import "./components/project";
import type { TreeID } from "loro-crdt";
import type { TaskData, ProjectData, Metadata } from "../src/state/types";
import type { Renderer } from "../src/view/renderer";
import type { HProject } from "./components/project";


export class HtmlRenderer implements Renderer {
  constructor(private parent: HTMLElement) { }
  
  createTask(element: TaskData & { target: TreeID; parent: TreeID; }) {
    const el = document.createElement("div");
    el.id = element.target;
    
  }
  
  createProject(element: ProjectData & { id: TreeID; }) {
    const el = document.createElement("h-project") as HProject;
    el.id = element.id;
    
    el.changeTitle(element.title);
    el.changeDescriton(element.description);
    
    this.parent.appendChild(el);
    
    return el;
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
