import { type LoroTreeNode } from "loro-crdt";
import { populateProject, Types, type ProjectData } from "./types";
import { FractosNode } from "./tasks";


export class Project extends FractosNode {  
  private constructor(node: LoroTreeNode, commit: () => void) {
    super(node, commit);
    if (this.parent) throw Error(`A project can not have a parent`);
    if (this.type !== Types.PROJECT) throw Error(`this node is of type: ${this.type}`);
  }
  
  /**
   * 
   * @param node A node of type Project
   * @throws Error if the provided node is not a Project
   */
  static from(node: LoroTreeNode, commit: () => void): Project { return new Project(node, commit) }
  static convert(node: FractosNode): Project { return new Project(node.node, node.commit) }
  static new(node: LoroTreeNode, project: ProjectData, commit: () => void): Project {
    const _pr = new Project(node, commit);
    node.data.set("type", Types.PROJECT);
    populateProject(node, project);
    
    commit()
    return _pr
  }
  
  get metadata(): ProjectData {
    return {
      title: this.node.data.get("title") as string,
      description: this.node.data.get("description") as string,
    }
  }
}
