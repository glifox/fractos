import { LoroText, type LoroTreeNode } from "loro-crdt";
import { Types, type TaskData } from "./types";


export class Task {
  get id() { return this.node.id };
  get type() { return this.node.data.get("type") as Types };
  get parent() { return this.node.parent() };
  
  private constructor(public node: LoroTreeNode) {
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
    node.data.set("title", task.title);
    
    const description = new LoroText();
    description.insert(0, task.description);
    
    node.data.setContainer("description", description);
    
    return new Task(node);
  }
}
