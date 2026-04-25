import type { LoroEvent, LoroEventBatch, TreeDiff, TreeID } from "loro-crdt";
import { type FractosState } from "../state/state";
import { FractosNode, type FractosNodeData, type FractosNodeType, type Keys, type nodeTypes, type NodeType, defaults, type ValueOf } from "../state/node";


type ViewModeHandlers = {
  [K in ViewMode["type"]]: (mode: Extract<ViewMode, { type: K }>) => void;
};

export interface Node<K extends keyof FractosNodeType> {
  type: K,
  treeid: TreeID,
  element: HTMLElement,
  set<P extends keyof FractosNodeType[K]>(key: keyof FractosNodeType[K], value: FractosNodeType[K][P]): void;
  
  showChildren: boolean;
  
  moveChildNode(id: TreeID, index: number, old: number): void,
  insertChildNode<C extends keyof FractosNodeType>(element: Node<C>): void,
  removeChildNode(id: TreeID, keepElement: boolean): void,
  
  updateIndex(): void,
}

type Renderer = { [K in NodeType]: (view: FractosView, node: FractosNode) => Node<K> };

export class FractosView {
  state: FractosState;
  private mode: ViewMode;
  private __parent: HTMLElement;
  private renderer: Renderer;
  private nodes: Map<TreeID, Node<NodeType>> = new Map();
  private children: TreeID[] = [];
  
  constructor(config: {
    state: FractosState,
    parent: HTMLElement,
    renderer: Renderer,
    mode?: ViewMode,
  }) {
    this.state = config.state;
    this.__parent = config.parent;
    this.renderer = config.renderer;
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
  
  setMode(mode: ViewMode) {
    this.mode = mode;
    this._render();
  }
  
  // @ts-ignore
  private _render() { this._mode[this.mode.type](this.mode) }
  
  private _renderProject(node: FractosNode) {
    if (this.nodes.has(node.treeid)) return;
    
    const project_ = this.renderer.project(this, node);
    
    this.nodes.set(node.treeid, project_);
    this.__parent.appendChild(project_.element);
    this.children.push(node.treeid);
    
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
    
    parent.insertChildNode(node_);
    if (node_.showChildren) this._renderChildren(node_);
  }
  
  private updateChildrenIndex(init: number = 0) {
    for (let index = init; index < this.children.length; index++) {
      const treeid = this.children[index]!;
      const node = this.nodes.get(treeid);
      node?.updateIndex();
    }
  }
  
  private reorderChildren(id: TreeID, index: number, old: number) {
    if (index == old) return;
    
    const target_ = this.nodes.get(id);
    if (!target_) return;
    
    let anchorid: TreeID | undefined = undefined;
    
    if (index > old) anchorid = this.children[index + 1]!;
    else anchorid = this.children[index];
    
    const anchor_ = anchorid ? this.nodes.get(anchorid) : undefined;
    this.__parent.insertBefore(target_.element, anchor_?.element ?? null);
    
    const element = this.children.splice(old, 1)[0]!;
    this.children.splice(index, 0, element);
    
    this.updateChildrenIndex((index > old) ? old : index);
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
        
        if (parent_) parent_.removeChildNode(node_.treeid, false);
        else this.__parent.removeChild(node_.element);
        
        this.nodes.delete(node_.treeid);
        
        if (this.mode.type === 'selected') this.setMode({ type: 'none' });
        if (this.mode.type === 'all') this.updateChildrenIndex(item.oldIndex);
        
        continue;
      }
      
      if (item.action == "move") {
        const parent = item.parent ? this.nodes.get(item.parent) : undefined;
        const oldParent = item.oldParent ? this.nodes.get(item.oldParent) : undefined;
        
        if (parent && item.parent === item.oldParent) {
          parent.moveChildNode(item.target, item.index, item.oldIndex);
          continue;
        }
        
        if (!oldParent && item.parent === item.oldParent) {
          this.reorderChildren(item.target, item.index, item.oldIndex)
          continue;
        }
        
        
        continue;
      }
    }
  }
}

type ViewMode = ShowAll | Selected | None;
type ShowAll = { type: "all" };
type Selected = { type: "selected", project: TreeID };
type None = { type: "none" }
