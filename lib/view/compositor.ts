import type { TreeID } from "loro-crdt";
import type { Node } from "./view";
import type { NodeType } from "../state/node";


export class Compositor {
  private children: TreeID[] = []
  private nodes: Map<TreeID, Node<NodeType>> = new Map();
  
  constructor(private element: HTMLElement) {}
  
  push(node: Node<NodeType>) {
    const treeid = node.treeid;
    
    this.element.appendChild(node.element);
    this.nodes.set(treeid, node);
    this.children.push(treeid);
  }
  
  pop(): TreeID | undefined {
    if (this.children.length == 0) return;
    
    const treeid = this.children.pop()!;
    const node = this.nodes.get(treeid)!;
    
    this.element.removeChild(node.element);
    return treeid
  }

  delete (index: number): TreeID | undefined  {
    if (this.children.length > index) return;
    
    const treeid = this.children.splice(index, 1)[0]!;
    
    this.updateChildrenIndex(index);
    return treeid
  }
  
  insert(node: Node<NodeType>, index: number | null) {
    const childrenlength = this.children.length;
    if (childrenlength === 0 || index === null) return this.push(node);
    
    const safeindex = (childrenlength > index) ? index : childrenlength - 1;
    const treeid = node.treeid;
    
    this.children.splice(safeindex, 0, treeid);
    this.nodes.set(treeid, node);
    
    const reference = this.nodes.get(this.children[safeindex + 1]!);
    this.element.insertBefore(node.element, reference?.element ?? null);
    
    this.updateChildrenIndex(index);
  }
  
  
  move(treeid: TreeID, index: number, oldindex: number) {
    if (index == oldindex) return;
    
    const target_ = this.nodes.get(treeid);
    if (!target_) return;
    
    let anchorid: TreeID | undefined = undefined;
    
    if (index > oldindex) anchorid = this.children[index + 1]!;
    else anchorid = this.children[index];
    
    const anchor_ = anchorid ? this.nodes.get(anchorid) : undefined;
    this.element.insertBefore(target_.element, anchor_?.element ?? null);
    
    const element = this.children.splice(oldindex, 1)[0]!;
    this.children.splice(index, 0, element);
    
    this.updateChildrenIndex((index > oldindex) ? oldindex : index);
  }
  
  get(index: number) { return this.children[index] }
  
  private updateChildrenIndex(init: number = 0) {
    for (let index = init; index < this.children.length; index++) {
      const treeid = this.children[index]!;
      const node = this.nodes.get(treeid);
      node?.updateIndex();
    }
  }
}
