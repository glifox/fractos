import type { TreeID } from "loro-crdt";
import type { FractosState, Metadata } from "./state";


export class FractosView {
  state: FractosState;
  private parent: HTMLElement;
  private mode: ViewMode;
  private render: FractosRenderer;
  private viewState: FractosViewState;
  private __projects: WeakMap<HTMLElement, __Project> = new WeakMap();
  private __tasks: WeakMap<HTMLElement, __Task> = new WeakMap();
  
  
  constructor(config: {
    state: FractosState,
    parent: HTMLElement,
    render: FractosRenderer,
    viewState: FractosViewState,
    mode?: ViewMode,
  }) {
    this.parent = config.parent;
    this.state = config.state;
    this.viewState = config.viewState;
    
    this.mode = config.mode || { type: "all" };
    this.render = config.render;
    
    this._render();
  }
  
  private _mode: ViewModeHandlers = {
    all: (mode: ShowAll) => this.state.projects(this._renderProject.bind(this)),
    selected: (mode: Selected) => {
      
    },
    none: (mode: None) => {
      
    },
  }
  // @ts-ignore
  private _render() { this._mode[this.mode.type](this.mode) }
  
  private _renderProject(id: TreeID, data: Metadata) {
    const project = this.render.project(data);
    
    project.self.id = id; 
    
    this.__projects.set(project.self, project);
    this._renderChildren(id, project);
    this.parent.appendChild(project.self);
  }
  
  private _renderChildren(id: TreeID, parent: __Project | __Task) {
    const fragment = document.createDocumentFragment();
    this.state.tasks(id, (id, data) => {
      const task = this.render.task(data);
      
      task.self.id = id;
      
      this.__tasks.set(task.self, task);
      
      if (this.viewState.show.children(id)) {
        this._renderChildren(id, task);
      }
      
      fragment.appendChild(task.self);
    })
    
    parent.tasks.appendChild(fragment);
  }
}

export interface FractosRenderer {
  task: (data: Metadata) => __Task,
  project: (data: Metadata) => __Project,
}

export interface FractosViewState {
  show: {
    children: (id: TreeID) => boolean,
    description: (id: TreeID) => boolean,
  }
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

type __State = {
  show: {
    children: true,
    description: true,
  }
}

type ViewModeHandlers = {
  [K in ViewMode["type"]]: (mode: Extract<ViewMode, { type: K }>) => void;
};
