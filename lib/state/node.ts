import { LoroTreeNode, type TreeID } from "loro-crdt";

export type ProjectData = {
  type: 'project',
  title: string,
  description: string,
};

export type TaskData = {
  type: 'task',
  title: string,
  description: string,
  percentage?: number,
}


export type NodeType = FractosNodeData['type'];
export type FractosNodeData = ProjectData | TaskData;
export type FractosNodeType = { [P in FractosNodeData as P['type']]: P; };
export type ParcialFractosNodeData = {
  [K in FractosNodeData as 'type']: K['type'];
} & Partial<FractosNodeData>;

type AllNodeKeys<T> = T extends any ? keyof T : never;
export type Keys = AllNodeKeys<FractosNodeData>;
export type ValueOf<T, K extends PropertyKey> = T extends any ? K extends keyof T ? T[K] : never : never;

export type Metadata = FractosNodeData & { 
  index: number,
};

export const defaults: FractosNodeType = {
  project: {
    type: 'project',
    title: "",
    description: ""
  },
  task: {
    type: 'task',
    title: "",
    description: "",
    percentage: 0
  }
} as const;

export const nodeTypes = Object.keys(defaults) as NodeType[];

export class FractosNode {
  private constructor(public readonly node: LoroTreeNode) {  }
  
  static from(node: LoroTreeNode) { return new FractosNode(node) }
  static populate(node: LoroTreeNode, data: FractosNodeData) {
    for (const key of Object.keys(defaults[data.type])) {
      // @ts-ignore
      let value = data[key] || defaults[data.type][key];
      node.data.set(key, value);
    }
  }
  
  get metadata() {
    // @ts-ignore
    const metadata: Metadata = {
      index: this.node.index()!,
    };
    
    for (const key of this.node.data.keys()) {
      // @ts-ignore
      metadata[key] = this.node.data.get(key);
    }
    
    return metadata
  }
  
  get<K extends Keys>(key: K): ValueOf<FractosNodeData, K> {
    // @ts-ignore
    return this.node.data.get(key);
  }
  
  get treeid(): TreeID { return this.node.id }
  get index() { return this.node.index() }
  get hasChildren(): boolean {
    const children = this.node.children();
    return (children !== undefined && children.length > 0)
  }
}

