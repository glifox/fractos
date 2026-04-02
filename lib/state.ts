import { LoroTree, LoroTreeNode, type LoroDoc, type LoroEventBatch, type Subscription, type TreeID } from "loro-crdt";


const types = ["project", "task"] as const;
type Type = typeof types[number];

const actions = ["create", "move", "update", "delete"] as const;
type Action = typeof actions[number];

export class FractosState {
  private doc: LoroDoc
  private root: LoroTree
  
  constructor(config: { id?: string, doc: LoroDoc }) {
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
  
  getNodeByID(id: TreeID, type?: Type): LoroTreeNode {
    const node = this.root.getNodeByID(id);
    this.assert(node, `Node not found with id: '${id}'`);
    
    if (type) {
      if (type === "project") this.assert(node?.parent() == undefined, `This ${id} is not a project`)
      if (type === "task") this.assert(node?.parent(), `This ${id} is not a task`)
    }
    
    return node!;
  }
  
  
  createProject(data: ProjectData): TreeID {
    const node = this.root.createNode();
    
    populateProject(node, data);
    this.commit("create", "project", `Create project: ${data.title}`);
    
    return node.id;
  }
  
  createTask(data: TaskData, id: TreeID): TreeID {
    const parent = this.getNodeByID(id);
    
    const node = parent.createNode();
    populateTask(node, data);
    this.updateParent(parent);
    
    this.commit("create", "task", `Create task: ${data.title}`);
    return node.id;
  }
  
  moveTask(id: TreeID, parent: TreeID) {
    const node = this.getNodeByID(id);
    const currentParent = node.parent(); 
    this.assert(currentParent, "Node is not a task");
    
    const newParent = this.getNodeByID(id);
    
    this.root.move(id, parent);
    this.updateParent(currentParent!);
    this.updateParent(newParent);
    this.commit("move", "task", `Move task: ${node.data.get("title")} to ${newParent.data.get("title")}`);
  }
  
  update(data: Metadata & { type: Type, id: TreeID }) {
    this.assert(types.includes(data.type), `The type can only be ${types}`)
    if (data.type === "project") {
      this.assert(("percentage" in data), "You can not change the project percentage")
    }
    
    const node = this.getNodeByID(data.id);
    const default_data = {
      "project": default_project_data,
      "task": default_task_data,
    }[data.type];
    
    for (const key of Object.keys(default_data)) {
      // @ts-ignore
      let value = data[key];
      if (value == null || value == undefined) continue;
      
      node.data.set(key, value);
    }
    
    if ("percentage" in data) this.updateParent(node.parent()!)
    this.commit("update", data.type, `Update ${data.type}: ${data.title}`);
  }
  
  delete(id: TreeID) {
    const node = this.getNodeByID(id);
    this.root.delete(id);
    const parent = node.parent();
    
    if (parent) this.updateParent(parent!);
    const type = (parent) ? "task" : "project";
    this.commit("delete", type, `Delete ${type}: ${node.data.get("title")}`)
  }
  
  percentage(node: LoroTreeNode): number { return (node.data.get("percentage") || 0)  as number }
  private updateParent(parent: LoroTreeNode) {
    const children = parent.children()!;
    this.assert(children.length > 0, "Imposible yo update a parent with no children");
    const last = this.percentage(parent);
    
    let sum = 0;
    for (const child of children) {
      sum += this.percentage(child);
    }
    
    const result = sum / children.length;
    
    if (result == last) return;
    parent.data.set("percentage", result);
    
    const _parent = parent.parent();
    if (_parent) this.updateParent(_parent)
  }
  
  projects<K>(callback: (id: TreeID, data: Metadata) => K): K[] {
    return this.root.roots()
      .map((node) => {
        return callback(node.id, getMetadata(node))
      })
  }
  
  tasks<K>(id: TreeID, callback: (id: TreeID, data: Metadata) => K): K[] {
    const node = this.getNodeByID(id);
    
    return (node.children() || [])
      .map((node) => {
        return callback(node.id, getMetadata(node))
      })
  }
  
  subscribe(callback: (event: LoroEventBatch) => void): Subscription {
    return this.root.subscribe(callback)
  }
}

export type Metadata = {
  [K in keyof TaskData | keyof ProjectData]?: 
    K extends keyof TaskData ? TaskData[K] : 
    K extends keyof ProjectData ? ProjectData[K] : 
    never;
};

export type ProjectData = {
  title: string,
  description: string,
};

export type TaskData = {
  title: string,
  description: string,
  percentage?: number,
}

const default_project_data: ProjectData = {
  title: "error",
  description: "error",
}

const default_task_data: TaskData = {
  title: "error",
  description: "error",
  percentage: 0,
}

function populateProject(node: LoroTreeNode, data: ProjectData) {
  for (const key of Object.keys(default_project_data)) {
    // @ts-ignore
    let value = data[key] || default_project_data[key];
    node.data.set(key, value);
  }
}

function populateTask(node: LoroTreeNode, data: TaskData) {  
  for (const key of Object.keys(default_task_data)) {
    // @ts-ignore
    let value = data[key] || default_task_data[key];
    node.data.set(key,  value);
  }
}

export function getMetadata(node: LoroTreeNode): Metadata {
  const metadata: Metadata = {};
  for (const key of node.data.keys()) {
    // @ts-ignore
    metadata[key] = node.data.get(key);
  }
  
  return metadata
}
