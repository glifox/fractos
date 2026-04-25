import type { TreeID } from "loro-crdt";
import type { Node } from "./view";
import type { NodeType } from "../state/node";

export interface Compositor {
  push(node: Node<NodeType>): void,
  pop(): Node<NodeType> | undefined,
  delete(treeid: TreeID): Node<NodeType> | undefined,
  insert(node: Node<NodeType>, index: number | null): void,
  move(treeid: TreeID, index: number, oldindex: number): void,
  get(index: number): Node<NodeType> | undefined,
}

export class FractosCompositor implements Compositor {
  private children: TreeID[] = []
  private nodes: Map<TreeID, Node<NodeType>> = new Map();
  
  constructor(private element: HTMLElement) {}
  
  push(node: Node<NodeType>) {
    const treeid = node.treeid;
    if (this.nodes.has(treeid)) return;
    
    this.element.appendChild(node.element);
    this.nodes.set(treeid, node);
    this.children.push(treeid);
  }
  
  pop(): Node<NodeType> | undefined {
    if (this.children.length == 0) return;
    
    const treeid = this.children.pop()!;
    const node_ = this.nodes.get(treeid)!;
    this.nodes.delete(treeid);
    
    this.element.removeChild(node_.element);
    return node_
  }

  delete(treeid: TreeID): Node<NodeType> | undefined  {
    if (!this.nodes.has(treeid)) return;
    
    
    const index = this.children.indexOf(treeid);
    if (index === -1) throw new Error(`[fractos:compositor] Desync error children must have '${treeid}'`);
    this.children.splice(index, 1)[0]!;
    
    const node_ = this.nodes.get(treeid);
    if (!node_) throw new Error(`[fractos:compositor] Desync error children must have '${treeid}'`);
    
    this.element.removeChild(node_.element);
    this.nodes.delete(treeid);
    
    this.updateChildrenIndex(index);
    return node_
  }
  
  insert(node: Node<NodeType>, index: number | null) {
    const childrenlength = this.children.length;
    if (childrenlength === 0 || index === null) return this.push(node);
    
    const safeindex = (childrenlength > index) ? index : childrenlength - 1;
    const treeid = node.treeid;
    if (this.nodes.has(treeid)) return;
    
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
  
  get(index: number): Node<NodeType> | undefined {
    const treeid = this.children[index]
    if (!treeid) return;
    
    return this.nodes.get(treeid)
  }
  
  private updateChildrenIndex(init: number = 0) {
    for (let index = init; index < this.children.length; index++) {
      const treeid = this.children[index]!;
      const node = this.nodes.get(treeid);
      node?.updateIndex();
    }
  }
}
