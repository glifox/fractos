import type { LoroEventBatch, TreeDiff, TreeID } from "loro-crdt";
import { type FractosState } from "../state/state";
import { FractosNode, type Keys, type nodeTypes, type NodeType, defaults, type ValueOf } from "../state/node";
import { FractosCompositor, type Compositor } from "./compositor";
import type { Renderer, Node, ViewModeHandlers, ViewMode, ShowAll, Selected, None } from "./view.types";


export class FractosView {
  state: FractosState;
  private mode: ViewMode;
  private renderer: Renderer;
  private nodes: Map<TreeID, Node<NodeType>> = new Map();
  private compositor: Compositor;
  
  constructor(config: {
    state: FractosState;
    renderer: Renderer;
    mode?: ViewMode;
  } & ({
    parent: HTMLElement;
    compositor?: never;
  } | {
    parent?: never;
    compositor: Compositor;
  })) {
    this.state = config.state;
    
    this.compositor = config.compositor ? config.compositor : new FractosCompositor(config.parent);
    this.renderer = config.renderer;
    
    this.mode = config.mode ?? { type: "all" };
    this._render();
    
    this.state.subscribe(this._handleEvents.bind(this));
    this.state.onimport(() => { this.setMode({ type: 'all' }) });
  }
  
  private _mode: ViewModeHandlers = {
    all: (mode: ShowAll) => {
      this.state.projects((project) => {
        let node_ = this.nodes.get(project.treeid);
        if (!node_) {
          this._renderProject(project);
          return 
        }
        
        this.compositor.insert(node_, project.index ?? null)
      })
      this._onModeChanged(mode);
    },
    selected: (mode: Selected) => {
      this.state.projects((node) => {
        if (
          node.treeid == mode.project &&
          this.nodes.has(node.treeid)
        ) this.compositor.insert(this.nodes.get(node.treeid)!, node.index ?? null);
        else if (node.treeid == mode.project) this._renderProject(node);
        else this.compositor.delete(node.treeid)
      })
      this._onModeChanged(mode);
    },
    none: (mode: None) => {
      this._onModeChanged(mode);
    },
  }
  
  setMode(mode: ViewMode) {
    if (mode.type == this.mode.type) return;
    this.mode = mode;
    this._render();
  }

  private _onModeChanged(mode: ViewMode)  {
    const event = new CustomEvent('fractos:view:mode', { detail: mode });
    this.compositor.parent.dispatchEvent(event)
  }
  
  // @ts-ignore
  private _render() { this._mode[this.mode.type](this.mode) }
  
  private _renderProject(node: FractosNode) {
    if (this.nodes.has(node.treeid)) return;
    
    const project_ = this.renderer.project(this, node);
    
    this.nodes.set(node.treeid, project_);
    this.compositor.insert(project_, node.index ?? null);
    
    if (project_.showChildren) this._renderChildren(project_)
  }
  
  _renderChildren<K extends NodeType>(parent: Node<K>) {
    this.state.tasks(
      parent.treeid,
      (node) => this._renderNode(node, parent)
    )
  }
  
  _renderNode<K extends NodeType>(node: FractosNode, parent: Node<K>) {
    const type = node.get("type");
    const node_ = (this.nodes.has(node.treeid))
      ? this.nodes.get(node.treeid)!
      : this.renderer[type](this, node);
    
    this.nodes.set(node.treeid, node_);
    
    parent.compositor.insert(node_, node.index ?? null);
    if (node_.showChildren) this._renderChildren(node_);
  }
  
  private *dedupe(events: LoroEventBatch) {
    for (const event of events.events) {
      yield event
      if (events?.origin === "fractos::create::project") break;
    }
  }
  
  private _handleEvents(events: LoroEventBatch) {
    if (!events?.origin?.startsWith("fractos")) return;
    if (events.by === "checkout") return;
    
    window.requestAnimationFrame(() => {
      for (const event of this.dedupe(events)) {
        if (event.diff.type === "map") {
          const treeid = event.path[1] as TreeID;
          
          const node_ = this.nodes.get(treeid);
          if (!node_) continue;
          
          const type = node_.type;
          for (const attribute of Object.keys(event.diff.updated)) {
            if (attribute in defaults[type] || (attribute === "percentage" && type === "project")) {
              // @ts-ignore
              node_.set(attribute, event.diff.updated[attribute])
            }
          }
          
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
        const parentid = item.parent;
        
        if (
          !parentid &&
          (
            (this.mode.type === "selected" && this.mode.project === parentid) ||
            this.mode.type === "all"
          )
        ) {
          this._renderProject(this.state.getFractosNodeByID(item.target))
          // Todo: reorder children
          continue
        } else if (!parentid) continue;
        
        if (!this.nodes.has(parentid)) return;
        const parent_ = this.nodes.get(parentid)!
        
        if (parent_.showChildren) {
          this._renderNode(this.state.getFractosNodeByID(item.target), parent_)
        }
        
        continue;
      }
      
      if (item.action == "delete") {
        const parent_ = item.oldParent ? this.nodes.get(item.oldParent) : undefined;
        if (item.oldParent && !parent_) continue;
        
        const node_ = this.nodes.get(item.target);
        if (!node_) continue
        
        this.nodes.delete(node_.treeid);
        
        if (parent_) if (parent_.showChildren) parent_.compositor.delete(node_.treeid);
        else this.compositor.delete(node_.treeid);
        
        
        if (this.mode.type === 'selected') this.setMode({ type: 'none' });
        
        continue;
      }
      
      if (item.action == "move") {
        const parent_ = item.parent ? this.nodes.get(item.parent) : undefined;
        const oldParent_ = item.oldParent ? this.nodes.get(item.oldParent) : undefined;
        
        if (parent_ && item.parent === item.oldParent) {
          parent_.compositor.move(item.target, item.index, item.oldIndex);
          continue;
        }
        
        if (!oldParent_ && item.parent === item.oldParent) {
          this.compositor.move(item.target, item.index, item.oldIndex)
          continue;
        }
        
        const node_ = (oldParent_?.showChildren) ? oldParent_?.compositor.delete(item.target) : undefined;
        
        if (
          node_ &&
          parent_ &&
          parent_.showChildren
        ) parent_.compositor.insert(node_, item.index);
        
        else
        if (!node_ && parent_ && parent_.showChildren) {
          const node = this.state.getFractosNodeByID(item.target);
          this._renderNode(node, parent_);
        }
        
        else if(node_) this.nodes.delete(node_.treeid);
        
        continue;
      }
    }
  }
}
