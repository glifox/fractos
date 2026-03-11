import type { LoroEvent, LoroEventBatch, LoroTreeNode, MapDiff, Subscription, TreeDiffItem, TreeID } from "loro-crdt";
import { State } from "../state/_state";
import { Task } from "../state/tasks";
import { Project } from "../state/project";
import { Types } from "../state/types";
import { SimpleRenderer, type Renderer } from "./renderer";

interface One { type: "selection", project: Project }
interface All { type: "all" };
interface None { type: "none" };

export type Mode = One | All | None; 

type ViewConfiguration = {
  renderer?: Renderer,
  mode?: Mode,
}

type visibleNode = { [key: TreeID]: boolean };

export class View {
  subcription: Subscription;
  mode: Mode = { type: "none" };
  visible: visibleNode = {  };
  renderer: Renderer;
  
  constructor(
    public state: State,
    config: ViewConfiguration,
  ) {
    this.renderer = (config.renderer) ? config.renderer : new SimpleRenderer();
    this.render(config?.mode)
    
    this.subcription = this.state.subscribe(this.on_change.bind(this))
  }
  
  private render(mode?: Mode) {
    if (!mode || mode.type === "none") return;
    else
    if (mode.type === "selection") {
      this.visible[mode.project.id] = true;
      this.renderer.createProject({ id: mode.project.id, ...mode.project.metadata});
    }
    else
    if (mode.type === "all") {
      for (const pr of this.state.getProjects()) {
        this.visible[pr.id] = true;
        this.renderer.createProject({ id: pr.id, ...pr.metadata });
      }
    }
  }
  
  private *dedupe(events: LoroEvent[]) {
    const creation: Set<TreeID> = new Set();
    
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
    if (this.mode.type == "none") return;
    console.info( "events", event);
    
    const events = this.dedupe(event.events);
    
    requestAnimationFrame(() => {
      for (const event of events) {
        if (event.diff.type === "tree") this.updateTree(event.diff.diff)
        else
        if (event.diff.type === "map") this.updateElement(event)
      }
    })
  }
  
  private get create(): Record<Types, (node: LoroTreeNode) => void> {
    return {
      [Types.PROJECT]: (node) => {
        const project = Project.from(node);
        this.renderer.createProject({ id: project.id, ...project.metadata})
      },
      [Types.TASK]: (node) => {
        const task = Task.from(node);
        this.renderer.createTask({
          target: task.id,
          parent: task.parent!.id,
          ... task.metadata
        })
      }
    }
  }
  
  private updateTree(items: TreeDiffItem[]) {    
    const actions = {
      create: (item: TreeDiffItem) => { 
        const node = this.state.getNode(item.target);
        if (!node) return;
        
        // todo: Control de creacion, si ya existe o no esta visible no enviar la solicitud de crear 
        if (node.type === Types.PROJECT) return;
        this.create[node.type](node.node)
      },
      delete: (item: TreeDiffItem) => { 
      },
      move: (item: TreeDiffItem) => { 
        
      },
    }
    
    for (const item of items) {      
      if (item.action in actions) actions[item.action](item)
    }
  }
  
  private updateElement(item: LoroEvent) {
    const id = item.path[1] as TreeID;
    const changes = (item.diff as MapDiff).updated;
    
    delete changes.percentage;
    if (Object.keys(changes).length == 0) return;
    
    this.renderer.update(id, changes);
  }
  
  private delete(node: TreeID) {
    
  }
}