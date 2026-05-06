import type { LoroDoc, LoroEventBatch, LoroTree, LoroTreeNode, Subscription, TreeID } from "loro-crdt";
import { defaults, FractosNode, nodeTypes, type FractosNodeData, type ParcialFractosNodeData, type NodeType, type ProjectData, type TaskData } from "./node";


type Type = NodeType | 'action';

const actions = ["create", "move", "update", "delete", "copy"] as const;
type Action = typeof actions[number];

type Target = { node: LoroTreeNode } | { id: TreeID };

export class FractosState {
  private doc: LoroDoc
  private root: LoroTree
  
  constructor(config: {
    id?: string,
    doc: LoroDoc,
  }) {
    this.doc = config.doc
    this.root = this.doc.getTree(config.id || "fractos")
  }
  
  private assert(test: unknown, message: string) {
    if (test) return;
    throw Error(`[fractos:state]: ${message}`)
  }
  
  private commit(action: Action, type: Type, message: string) {
    return this.doc.commit({
      origin: `fractos::${action}::${type}`,
      message,
      timestamp: (Date.now() / 1000)
    })
  }
  
  private nodeFromTarget(target: Target): LoroTreeNode {
    if ('node' in target) return target.node
    else
    if ('id' in target) return this.getNodeByID(target.id)
    
    this.assert(false, `Invalid parameter ${target}`)
    // @ts-ignore
    return;
  }
  
  private getNodeByID(id: TreeID, type?: Type): LoroTreeNode {
    const node = this.root.getNodeByID(id);
    this.assert(node, `Node not found with id: '${id}'`);
    
    if (type) {
      if (type === "project") this.assert(node?.parent() == undefined, `This ${id} is not a project`)
      if (type === "task") this.assert(node?.parent(), `This ${id} is not a task`)
    }
    
    return node!;
  }
  
  getFractosNodeByID(id: TreeID, type?: Type): FractosNode {
    return FractosNode.from(this.getNodeByID(id, type))
  }
  
  create(data: ProjectData | (TaskData & { parent: TreeID })): TreeID {
    
    let node = null;
    let parent = null;
    
    if (data.type === "project") {
      node = this.root.createNode();
    }
    
    if (data.type === "task") {
      parent = this.getNodeByID(data.parent);
      node = parent.createNode();
    }
    
    FractosNode.populate(node!, data);
    
    if (data.type === "task") this.__reCalculatePercentage(parent!)
    this.commit("create", data.type, `Create project: ${data.title}`);
    
    return node!.id;
  }
  
  moveTask(id: TreeID, parent: TreeID) {
    const node = this.getNodeByID(id);
    const currentParent = node.parent(); 
    this.assert(currentParent, "Node is not a task");
    
    const newParent = this.getNodeByID(id);
    
    this.root.move(id, parent);
    this.__reCalculatePercentage(currentParent!);
    this.__reCalculatePercentage(newParent);
    this.commit("move", "task", `Move task: ${node.data.get("title")} to ${newParent.data.get("title")}`);
  }
  
  moveRelativeTo(target: Target, type: { type: 'after' | 'before', base: Target }) {
    this.assert(
      (type.type === 'after' || type.type === 'before')
      , ``
    )
    const node = this.nodeFromTarget(target);
    const base = this.nodeFromTarget(type.base);
    
    const node_parent = node.parent();
    const base_parent = base.parent();
    
    if (type.type === 'after') node.moveAfter(base)
    if (type.type === 'before') node.moveBefore(base)
    
    if (node_parent?.id !== base_parent?.id) {
      if (node_parent) this.__reCalculatePercentage(node_parent)
      if (base_parent) this.__reCalculatePercentage(base_parent)
    }
    
    this.commit("move", node_parent ? 'task' : 'project', `Move node ${type.type}`);
  }
  
  update(data: ParcialFractosNodeData & { id: TreeID }) {
    this.assert(nodeTypes.includes(data.type), `The type can only be ${nodeTypes}`)
    if (data.type === "project") {
      this.assert(("percentage" in data), "You can not change the project percentage")
    }
    
    const node = this.getNodeByID(data.id);
    
    const defaults_ = defaults[data.type];
    
    for (const key of Object.keys(defaults_)) {
      // @ts-ignore
      let value = data[key];
      if (value == null || value == undefined) continue;
      
      node.data.set(key, value);
    }
    
    if ("percentage" in data) this.__reCalculatePercentage(node.parent()!)
    this.commit("update", data.type, `Update ${data.type}: ${data.title}`);
  }
  
  delete(id: TreeID) {
    const node = this.getNodeByID(id);
    const parent = node.parent();
    this.root.delete(id);
    
    if (parent) this.__reCalculatePercentage(parent!);
    const type = (parent) ? "task" : "project";
    this.commit("delete", type, `Delete ${type}: ${node.data.get("title")}`)
  }
  
  private percentage(node: LoroTreeNode): number { return (node.data.get("percentage") || 0) as number }
  /** Internal: Tigger recalculation of the percentage for the node and its parents, without triggering commits */
  private __reCalculatePercentage(parent: LoroTreeNode) {
    const children = parent.children() || [];
    const last = this.percentage(parent);
    
    let sum = 0;
    for (const child of children) {
      sum += this.percentage(child);
    }
    
    const result = (children.length > 0) ? sum / children.length : 0;
    
    if (result == last) return;
    parent.data.set("percentage", result);
    
    const _parent = parent.parent();
    if (_parent) this.__reCalculatePercentage(_parent)
  }

  /** Tigger recalculation of the percentage for the node and its parents */
  reCalculatePercentage(id: TreeID) {
    const parent = this.getNodeByID(id);
    const type = parent.parent() ? "task" : "project";
    this.__reCalculatePercentage(parent);
    this.commit("update", type, `Recaulculate percentage: ${type}`);
  }
  
  projects<K>(callback: (node: FractosNode) => K): K[] {
    return this.root.roots()
      .map((node) => {
        return callback(FractosNode.from(node))
      })
  }
  
  tasks<K>(id: TreeID, callback: (node: FractosNode) => K): K[] {
    const node = this.getNodeByID(id);
    
    return (node.children() || [])
      .map((node) => {
        return callback(FractosNode.from(node))
      })
  }
  
  /** Copies the exact structure of a task and its suntask to a certant parent */
  copy(node: Target, parent: Target) { this.__copy(node, parent, true) }
  
  /** Internal: Copies the exact structure of a task and its suntask to a certant parent, with and option to trigger a commit or not */
  private __copy(node: Target, parent: Target, commit: boolean) {
    const from = FractosNode.from(this.nodeFromTarget(node));
    const metadata = from.metadata;
    
    const parent_ = this.nodeFromTarget(parent);
    
    const copyTarget = parent_.createNode();
    FractosNode.populate(copyTarget, metadata);
    
    for (let child of from.node.children() ?? []) {
      this.__copy({ node: child }, { node: copyTarget }, false)
    }
    
    if (commit) {
      this.__reCalculatePercentage(parent_)
      this.commit('copy', 'action', `Copied ${from.get('title')} to ${parent_.data.get('title')}`)
    }
  }
  
  subscribe(callback: (event: LoroEventBatch) => void): Subscription {
    return this.root.subscribe(callback)
  }

  onimport(callback: (event: LoroEventBatch) => void): Subscription {
    return this.doc.subscribe((event) => {
      if (event.by == 'import') callback(event)
    })
  }
}