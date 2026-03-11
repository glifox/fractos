import type { Listener, LoroTree, Subscription, TreeDiff, TreeID } from "loro-crdt";
import { Project } from "./project";
import { Types, type ProjectData } from "./types";
import { Task, FractosNode } from "./tasks";


export class State {
  constructor(public tree: LoroTree) { }
  
  newProject(project: ProjectData): Project { return Project.new(this.tree.createNode(), project) }
  getNodeById(target: TreeID) { return this.tree.getNodeByID(target) }
  
  getNode(target: TreeID): FractosNode | undefined {
    const node = this.getNodeById(target);
    if (!node) return undefined;
    
    return new FractosNode(node);
  }
  
  getProject(target: TreeID): Project | undefined {
    const node = this.getNode(target);
    if (!node) return undefined;
    if (node.type !== Types.PROJECT) return undefined;
    
    return Project.from(node.node);
  }
  
  getProjects(): Project[] {
    return this.tree.getNodes()
      .flatMap((node) => {
        try   { return [Project.from(node)] }
        catch { return [] }
      })
  }
  
  getTask(target: TreeID): Task | undefined {
    const node = this.getNode(target);
    if (!node) return undefined;
    if (node.type !== Types.TASK) return undefined;
    
    return Task.from(node.node);
  }
  
  delete(target: TreeID) { this.tree.delete(target); }
  move(target: TreeID, parent?: TreeID, index?: number) {
    if (this.getNode(target)?.type !== Types.PROJECT && !target) {
      throw Error(`Only the ${Types.PROJECT}s can be orphans`);
    }
    
    this.tree.move(target, target, index)
  }
  
  subscribe(listener: Listener): Subscription {
    return this.tree.subscribe(listener);
  }
}
