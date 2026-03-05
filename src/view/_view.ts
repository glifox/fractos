import type { LoroEvent, LoroEventBatch, LoroTreeNode, MapDiff, Subscription, TreeDiff, TreeDiffItem, TreeID } from "loro-crdt";
import { State } from "../state/_state";
import { Task, type FractosNode } from "../state/tasks";
import { Project } from "../state/project";
import { Types, type Metadata } from "../state/types";


export interface Renderer {
  createTask(node: Task): HTMLElement,
  createProject(node: Project): HTMLElement,
  
  update(id: TreeID, metadata: Metadata): void,
  delete(id: TreeID): void,
  
  // reorderChilds(id: TreeID): HTMLElement,
  move(target: TreeID, parent?: TreeID): void,
}

class FractosRenderer implements Renderer {
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

export class View {
  subcription: Subscription;
  selected: TreeID | null = null;
  renderer: Renderer;
  
  constructor(
    public state: State,
    renderer?: Renderer,
    project?: TreeID
  ) {
    this.renderer = (renderer) ? renderer : new FractosRenderer();
    if (project) this.selected = project;
    
    this.subcription = this.state.subscribe(this.on_change.bind(this))
  }
  
  private on_change(event: LoroEventBatch) {
    console.info(event)
    const events = event.events;
    
    for (const event of events) {
      requestAnimationFrame(() => {
        if (event.diff.type === "tree") this.updateTree(event.diff.diff)
        else
        if (event.diff.type === "map") this.updateElement(event)
      })
    }
  }
  private get create(): Record<Types, (node: LoroTreeNode) => HTMLElement> {
    return {
      [Types.PROJECT]: (node) => {
        return this.renderer.createProject(Project.from(node))
      },
      [Types.TASK]: (node) => {
        return this.renderer.createTask(Task.from(node))
      }
    }
  }
  private updateTree(items: TreeDiffItem[]) {
    // const fragmento = document.createDocumentFragment();
    
    for (const item of items) {
      const actions = {
        create: (item: TreeDiffItem) => { 
          const node = this.state.getNode(item.target);
          if (!node) return;
          
          this.create[node.type](node.node)
        },
        delete: (item: TreeDiffItem) => {  },
        move: (item: TreeDiffItem) => {  },
      }
      
      if (item.action in actions) actions[item.action](item)
    }
  }
  
  private updateElement(item: LoroEvent) {
    const id = item.path[1] as TreeID;
    const changes = (item.diff as MapDiff).updated;
    console.table( changes);
  }
  
  private delete(node: TreeID) {
    
  }
}