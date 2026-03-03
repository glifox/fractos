import { LoroText, type LoroTree, type LoroTreeNode, type TreeID } from "loro-crdt";
import { Types, type ProjectData, type TaskData } from "./types";
import { Task } from "./tasks";


export class Project {
  get type() { return this.node.data.get("type") as Types };
  get parent() { return this.node.parent() };
  
  private constructor(public node: LoroTreeNode) {
    if (this.parent) throw Error(`A project can not have a parent`);
    if (this.type !== Types.PROJECT) throw Error(`this node is of type: ${this.type}`);
  }
  
  /**
   * 
   * @param node A node of type Project
   * @throws Error if the provided node is not a Project
   */
  static from(node: LoroTreeNode): Project { return new Project(node) }
  static new(node: LoroTreeNode, project: ProjectData): Project {
    node.data.set("type", Types.PROJECT);
    node.data.set("title", project.title);
    
    const description = new LoroText();
    description.insert(0, project.description);
    
    node.data.setContainer("description", description);
    
    return new Project(node);
  }
  
  createTask(data: TaskData, parent?: LoroTreeNode): TreeID {
    const node = parent?.createNode() || this.node.createNode();
    const task = Task.new(node, data);
    
    return task.id;
  }
}
