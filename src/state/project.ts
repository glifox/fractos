import { type LoroTreeNode } from "loro-crdt";
import { populateProject, Types, type ProjectData } from "./types";
import { FractosNode } from "./tasks";


export class Project extends FractosNode {  
  private constructor(node: LoroTreeNode) {
    super(node);
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
    populateProject(node, project);
    return new Project(node);
  }
  
  get metadata(): ProjectData {
    return {
      title: this.node.data.get("title") as string,
      description: this.node.data.get("description") as string,
    }
  }
}
