import { populateProject, populateTask, Types, type ProjectData, type TaskData } from "./types";
import { type LoroTreeNode, type TreeID } from "loro-crdt";


export class Node {
  get id(): TreeID { return this.node.id };
  get type() { return this.node.data.get("type") as Types };
  get parent() { return this.node.parent() };
  get children() { return this.node.children() || [] }
  
  constructor(public node: LoroTreeNode) { }
  
  private get _percentage() { return this.node.data.get("percentage") as number };
  percentage(callback: (child: TreeID, percentage: number) => void = () => { }): number {
    const children = this.children;
    const length = this.children.length;
    
    if (this.type === Types.PROJECT && length == 0) return 0;
    if (length == 0) {
      const total = this._percentage;
      callback(this.id, total);
      return total;
    }
    
    let sum = 0;
    for (const child of children) {
      const node = new Node(child);
      sum += node.percentage(callback);
    }
    
    const total = ((sum / length) * this.multiplayer) + (this.aditional);
    callback(this.id, total);
    return total;
  }
  
  private get multiplayer(): number {
    const records: Record<Types, number> = {
      [Types.PROJECT]: 1,
      [Types.TASK]: 0.99,
    }
    return records[this.type];
  }
  
  private get aditional(): number {
    const records: Record<Types, number> = {
      [Types.PROJECT]: 0,
      [Types.TASK]: this._percentage * 0.01,
    }
    return records[this.type];
  }
  
  createTask(data: TaskData): Task { return Task.new(this.node.createNode(), data); }
  update(data: { project?: ProjectData, task?: TaskData }): boolean {
    const records: Record<Types, () => boolean> = {
      [Types.PROJECT]: () => { 
        if (!data.project) return false;
        populateProject(this.node, data.project);
        return true;
      },
      [Types.TASK]: () => { 
        if (!data.task) return false;
        populateTask(this.node, data.task);
        return true;
      },
    }
    return records[this.type]();
  }
}

export class Task extends Node {
  private constructor(node: LoroTreeNode) {
    super(node)
    if (!this.parent) throw Error(`A task can not be orphan`);
    if (this.type !== Types.TASK) throw Error(`this node is of type: ${this.type}`);
  }
  
  /**
   * 
   * @param node A node of type Project
   * @throws Error if the provided node is not a Project
   */
  static from(node: LoroTreeNode): Task { return new Task(node) }
  static new(node: LoroTreeNode, task: TaskData): Task {
    node.data.set("type", Types.TASK);
    populateTask(node, task);
    return new Task(node);
  }
  
  get metadata(): TaskData {
    return {
      title: this.node.data.get("title") as string,
      description: this.node.data.get("description") as string,
    }
  }
}
