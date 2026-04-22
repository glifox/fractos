import type { LoroEvent, LoroEventBatch, TreeDiff, TreeID } from "loro-crdt";
import { type FractosState } from "../state/state";
import type { FractosNode } from "../state/node";

type ViewModeHandlers = {
  [K in ViewMode["type"]]: (mode: Extract<ViewMode, { type: K }>) => void;
};

export class FractosView {
  state: FractosState;
  private mode: ViewMode;
  private parent: HTMLElement;
  
  constructor(config: {
    state: FractosState,
    parent: HTMLElement,
    mode?: ViewMode,
  }) {
    this.parent = config.parent;
    this.state = config.state;
    
    this.mode = config.mode || { type: "all" };
    
    this._render();
    this.state.subscribe(this._handleEvents.bind(this));
  }
  
  private _mode: ViewModeHandlers = {
    all: (_: ShowAll) => this.state.projects(this._renderProject.bind(this)),
    selected: (mode: Selected) => {
      const project = this.state.getFractosNodeByID(mode.project, "project");
      this._renderProject(project);
    },
    none: (_: None) => {},
  }
  // @ts-ignore
  private _render() { this._mode[this.mode.type](this.mode) }
  
  private _renderProject(node: FractosNode) {
    
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
          
          continue;
        }
        
        if (event.diff.type === "tree") {
          this.updateTreeDOM(event.diff);
          continue;
        }
      }
    })
  }
  
  private updateTreeDOM(event: TreeDiff) {
    for (const item of event.diff) {
      if (item.action === "create") {
        
        continue;
      }
      
      if (item.action == "delete") {
        
        
        continue;
      }
      
      if (item.action == "move") {
        
        
        continue;
      }
    }
  }
}

type ViewMode = ShowAll | Selected | None;
type ShowAll = { type: "all" };
type Selected = { type: "selected", project: TreeID };
type None = { type: "none" }
