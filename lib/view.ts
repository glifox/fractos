import type { LoroTreeNode, TreeID } from "loro-crdt";
import type { FractosState } from "./state";


export class FractosView {
  
  
  
  
}

interface TaskElement {
  treeid: TreeID,
  setIndex: () => void,
}

class TaskView {
  constructor(
    private node: LoroTreeNode,
    private dom: TaskElement, 
  ) {
    
  }
}

