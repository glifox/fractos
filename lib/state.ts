import { LoroTree, LoroTreeNode, type LoroDoc, type LoroMap, type TreeID } from "loro-crdt";
import type { Project } from "../src/state/project";



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
  
  private commit(action: Action, type: Type, message: string) {
    return this.doc.commit({
      origin: `fractos::${action}::${type}`,
      message,
      timestamp: (Date.now() / 1000)
    })
  }
  
  private getNodeByID(id: TreeID): LoroTreeNode {
    const node = this.root.getNodeByID(id);
    if (!node) throw Error(`[fractos:state]: Node not found with id: '${id}'`);
    return node;
  }
  
  createProject(data: ProjectData): TreeID {
    const node = this.root.createNode();
    
    populateProject(node, data);
    this.commit("create", "project", `Create project: ${data.title}`)
    
    return node.id;
  }
  
  createTask(data: TaskData, id: TreeID): TreeID {
    const parent = this.getNodeByID(id);
    
    const node = parent.createNode();
    populateTask(node, data);
    this.commit("create", "task", `Create task: ${data.title}`)
    
    return node.id;
  }
  
  moveTask(id: TreeID, parent: TreeID) {
    const node = this.getNodeByID(id);
    if (!node.parent()) throw Error(`[fractos:state]: Node is not a task`);
    
    const newParent = this.getNodeByID(id);
    
    this.root.move(id, parent);
    this.commit("move", "task", `Move task: ${node.data.get("title")} to ${newParent.data.get("title")}`);
  }
  
  update(data: Metadata & { type: Type, id: TreeID }) {
    if (!types.includes(data.type)) throw Error(`[fractos:state]: The type can only be ${types}`)
    if (data.type === "project" && data.percentage) throw Error(`[fractos:state]: You can not change the project percentage`)
    
    const node = this.getNodeByID(data.id);
    
    for (const key of Object.keys(default_project_data)) {
      // @ts-ignore
      let value = data[key];
      if (!value) continue;
      
      node.data.set(key, value);
    }
    
    this.commit("update", data.type, `Update ${data.type}: ${data.title}`);
  }
  
  delete(id: TreeID) {
    const node = this.getNodeByID(id);
    this.root.delete(id);
    
    const type = (node.parent()) ? "task" : "project";
    this.commit("delete", type, `Delete ${type}: ${node.data.get("title")}`)
  }
  
  private _percentage(node: LoroTreeNode, callback: (id: TreeID, percentage: number) => void) {
    let [count, sum] = [0, 0];
    
    for (const child of node.children() || []) {
      
    }
    
  }
  
  percentage(id: TreeID, callback: (id: TreeID, percentage: number) => void) {
    const node = this.getNodeByID(id);
    this._percentage(node, callback)
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
