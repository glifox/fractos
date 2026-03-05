import type { LoroEvent, LoroEventBatch, LoroTreeNode, MapDiff, Subscription, TreeDiff, TreeDiffItem, TreeID } from "loro-crdt";
import { State } from "../state/_state";
import { Task } from "../state/tasks";
import { Project } from "../state/project";
import { Types } from "../state/types";
import { SimpleRenderer, type Renderer } from "./renderer";


export class View {
  subcription: Subscription;
  selected: TreeID | null = null;
  renderer: Renderer;
  
  constructor(
    public state: State,
    renderer?: Renderer,
    project?: TreeID
  ) {
    this.renderer = (renderer) ? renderer : new SimpleRenderer();
    if (project) this.selected = project;
    
    this.subcription = this.state.subscribe(this.on_change.bind(this))
  }
  
  private *dedupe(events: LoroEvent[]) {
    const creation: Set<TreeID> = new Set();
    
    console.table( events);
    for (const event of events) {
      if (event.diff.type === "tree") {
        for (const treediff of event.diff.diff) {
          if (treediff.action === "create") {
            creation.add(treediff.target)
          }
        }
        yield event
      }
      else
      if (
        event.diff.type === "map" &&
        !creation.has(event.path[1] as TreeID)
      ) {
        yield event
      }
    }
  }
  
  private on_change(event: LoroEventBatch) {
    const events = this.dedupe(event.events);
    
    requestAnimationFrame(() => {
      for (const event of events) {
        if (event.diff.type === "tree") this.updateTree(event.diff.diff)
        else
        if (event.diff.type === "map") this.updateElement(event)
      }
    })
  }
  private get create(): Record<Types, (node: LoroTreeNode) => HTMLElement> {
    return {
      [Types.PROJECT]: (node) => {
        const project = Project.from(node);
        return this.renderer.createProject({ target: project.id, ... project.metadata })
      },
      [Types.TASK]: (node) => {
        const task = Task.from(node);
        return this.renderer.createTask({
          target: task.id,
          parent: task.parent!.id,
          ... task.metadata
        })
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
          
          // todo: Control de creacion, si ya existe o no esta visible no enviar la solicitud de crear 
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
    this.renderer.update(id, changes);
  }
  
  private delete(node: TreeID) {
    
  }
}