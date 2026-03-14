import type { Listener, LoroDoc, LoroTree, Subscription, TreeDiff, TreeID } from "loro-crdt";
import { Project } from "./project";
import { Types, type ProjectData } from "./types";
import { Task, FractosNode } from "./tasks";


export class FractosState {
  private commiter: (options?: { origin?: string, timestamp?: number, message?: string }) => void;
  constructor(private tree: LoroTree, commit: (options?: { origin?: string, timestamp?: number, message?: string }) => void) { 
    this.commiter = commit;
  }
  
  newProject(project: ProjectData): Project {
    const pr = Project.new(this.tree.createNode(), project, this.commit)
    this.commit();
    return pr
  }
  getNodeById(target: TreeID) { return this.tree.getNodeByID(target) }
  
  getNode(target: TreeID): FractosNode | undefined {
    const node = this.getNodeById(target);
    if (!node) return undefined;
    
    return new FractosNode(node, this.commit);
  }
  
  getProject(target: TreeID): Project | undefined {
    const node = this.getNode(target);
    if (!node) return undefined;
    if (node.type !== Types.PROJECT) return undefined;
    
    return Project.from(node.node, this.commit);
  }
  
  getProjects(): Project[] {
    return this.tree.getNodes()
      .flatMap((node) => {
        try   { return [Project.from(node, this.commit)] }
        catch { return [] }
      })
  }
  
  getTask(target: TreeID): Task | undefined {
    const node = this.getNode(target);
    if (!node) return undefined;
    if (node.type !== Types.TASK) return undefined;
    
    return Task.from(node.node, this.commit);
  }
  
  delete(target: TreeID) {
    this.tree.delete(target);
    this.commit(`fractos delete: ${target}`)
  }
  
  move(target: TreeID, parent?: TreeID, index?: number) {
    if (this.getNode(target)?.type !== Types.PROJECT && !target) {
      throw Error(`Only the ${Types.PROJECT}s can be orphans`);
    }
    
    this.tree.move(target, parent, index)
    this.commit(`fractos move: ${target} to ${parent}`)
  }
  
  subscribe(listener: Listener): Subscription {
    return this.tree.subscribe(listener);
  }
  
  commit(message?: string) {
    this.commiter({
      origin: "FractosState",
      message,
    });
  }
}
