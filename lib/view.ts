import type { LoroEvent, LoroEventBatch, Subscription, TreeDiff, TreeID } from "loro-crdt";
import { getMetadata, type FractosState, type Metadata } from "./state";


export class FractosView {
  state: FractosState;
  private parent: HTMLElement;
  private mode: ViewMode;
  private render: FractosRenderer;
  private viewState: ViewState = new ViewState();
  private __projects: WeakMap<HTMLElement, __Project> = new WeakMap();
  private __tasks: WeakMap<HTMLElement, __Task> = new WeakMap();
  // unsubscribe: Subscription;
  
  constructor(config: {
    state: FractosState,
    parent: HTMLElement,
    render: FractosRenderer,
    mode?: ViewMode,
  }) {
    this.parent = config.parent;
    this.state = config.state;
    
    this.mode = config.mode || { type: "all" };
    this.render = config.render;
    
    this._render();
    
    this.viewState.subscribe(this._onStatusChange.bind(this));
    /*this.unsubscribe = */ this.state.subscribe(this._handleEvents.bind(this));
  }
  
  private _mode: ViewModeHandlers = {
    all: (_: ShowAll) => this.state.projects(this._renderProject.bind(this)),
    selected: (mode: Selected) => {
      const project = this.state.getNodeByID(mode.project, "project");
      this._renderProject(mode.project, getMetadata(project));
    },
    none: (_: None) => {},
  }
  // @ts-ignore
  private _render() { this._mode[this.mode.type](this.mode) }
  
  private _renderProject(id: TreeID, data: Metadata) {
    const project = this.render.project(data, id);
    
    project.self.id = id; 
    
    this.__projects.set(project.self, project);
    this._renderChildren(id, project);
    this.parent.appendChild(project.self);
  }
  
  private _renderChildren(id: TreeID, parent: __Project | __Task) {
    const fragment = document.createDocumentFragment();
    this.state.tasks(id, (id, data) => {
      const task = this._renderTask(id, data);
      
      if (this.viewState.show("children", id)) {
        this._renderChildren(id, task);
      }
      
      fragment.appendChild(task.self);
    })
    
    parent.tasks.appendChild(fragment);
  }
  
  private _renderTask(id: TreeID, data: Metadata) {
    const task = this.render.task(data, id);
    task.self.id = id;
    this.__tasks.set(task.self, task);
    
    return task
  }
  
  private getElement(id: TreeID): __Project | __Task | undefined {
    const __node = document.getElementById(id);
    if (!__node) return;
    
    return this.__projects.get(__node) || this.__tasks.get(__node);
  }
  
  private _onStatusChange(id: TreeID, state: ShowState) {
    const __element = this.getElement(id);
    if (!__element) return;
    
    this.render.changeState(__element, state);
  }
  
  private *dedupe(events: LoroEvent[]) {
    const creation: Set<TreeID> = new Set();

    for (const event of events) {
      yield event
    }
  }
  
  private _handleEvents(events: LoroEventBatch) {
    if (events.by === "checkout") return;
    
    window.requestAnimationFrame(() => {
      for (const event of this.dedupe(events.events)) {
        if (event.diff.type === "map") {
          const id = event.path[1] as TreeID;
          const __element = this.getElement(id);
          if (!__element) return;
          
          const changes = event.diff.updated;
          
          for (const key of Object.keys(changes)) {
            if (key in __element) {
              // @ts-ignore
              __element[key](changes[key])
            }
          }
          
          continue;
        }
        
        if (event.diff.type === "tree") this.updateTreeDOM(event.diff);
      }
    })
  }
  
  private updateTreeDOM(event: TreeDiff) {
    for (const item of event.diff) {
      if (item.action === "create") {
        if (this.getElement(item.target)) continue;
        
        const type = (item.parent) ? "task" : "project";
        
        if (
          type === "task" &&
          !this.viewState.show("children", item.parent!)
        ) continue
        
        if (
          type === "project" && this.mode.type !== "all"
        ) continue
        
        const data = getMetadata(this.state.getNodeByID(item.target));
        
        if (type === "task") {
          const parent = this.getElement(item.parent!);
          const task = this._renderTask(item.target, data)
          
          parent!.tasks.appendChild(task.self);
          
          continue;
        }
        
        if (type === "project") {
          this._renderProject(item.target, data);
        }
        
        continue;
      }
      else 
      if (item.action == "delete") {
        const treeid = item.target;
        const __element = document.getElementById(treeid);
        if (!__element) continue;
        
        __element.remove()
        
        continue;
      }
    }
  }
}

class ViewState {
  private state: Map<TreeID, ShowState>;
  private subcription = (id: TreeID, state: ShowState) => { };
  
  default: boolean = true;
  
  constructor() {
    this.state = new Map();
  }
  
  show(type: keyof ShowState, id: TreeID): boolean {
    const state = this.state.get(id);
    if (!state) return this.default;
    return state[type] || this.default;
  }
  
  set(id: TreeID, state: ShowState) {
    this.state.set(id, state)
    this.subcription(id, state)
  }
  
  subscribe(callback: (id: TreeID, state: ShowState) => void) {
    this.subcription = callback;
    return (() => { this.subcription = () => { } }).bind(this);
  }
}

export interface FractosRenderer {
  task: (data: Metadata, id: TreeID) => __Task,
  project: (data: Metadata, id: TreeID) => __Project,
  
  changeState: (el: __Task | __Project, state: ShowState) => void;
}

type ViewMode = ShowAll | Selected | None;
type ShowAll = { type: "all" };
type Selected = { type: "selected", project: TreeID };
type None = { type: "none" }

export type __Project = {
  readonly self: HTMLElement,
  readonly tasks: HTMLElement,
  readonly title: (value: string) => void,
  readonly description: (value: string) => void,
  readonly percentage: (value: number) => void,
}

export type __Task = {
  readonly self: HTMLElement,
  readonly tasks: HTMLElement,
  readonly title: (value: string) => void,
  readonly description: (value: string) => void,
  readonly percentage: (value: number) => void,
}

export type ShowState = {
  children: boolean,
  description: boolean,
}

type ViewModeHandlers = {
  [K in ViewMode["type"]]: (mode: Extract<ViewMode, { type: K }>) => void;
};
