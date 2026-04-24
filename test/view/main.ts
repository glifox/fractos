import { LoroDoc, type TreeID } from "loro-crdt";
import { FractosState, FractosView, type Node } from "../../lib/lib";
import type { ProjectData, FractosNodeType, FractosNode } from "../../lib/state/node";

class Project implements Node<'project'> {
  type = 'project' as const;
  
  treeid: `${number}@${number}`;
  element: HTMLElement;
  showChildren: boolean = false;
  
  constructor(private node: FractosNode) {
    this.treeid = this.node.treeid,
    this.element = document.createElement('div');
    this.element.innerHTML = `${this.node.get('type')}:${this.node.get('title')}:${this.node.get('description')}:${this.node.get('percentage')}`
  }
  
  set<P extends keyof ProjectData>(key: keyof ProjectData, value: ProjectData[P]): void {
    console.info("key:", key);
    this.element.innerHTML = `${this.node.get('type')}:${this.node.get('title')}:${this.node.get('description')}:${this.node.get('percentage')}`
  }
  
  moveChildNode(id: TreeID, index: number): void {
    throw new Error("Method not implemented.");
  }
  insertChildNode<C extends keyof FractosNodeType>(element: Node<C>): void {
    throw new Error("Method not implemented.");
  }
  removeChildNode(id: TreeID, keepElement: boolean): void {
    throw new Error("Method not implemented.");
  }
  
} 

const doc = new LoroDoc()

const state = new FractosState({ doc });
const view = new FractosView({
  state: state,
  parent: document.querySelector(".view")!,
  renderer: {
    project: (view, node) => {
      return new Project(node)
    },
    task: (view, node) => {
      throw new Error("Method not implemented.");
    }
  },
})


const pr = state.create({
  type: "project",
  title: "this is not a project",
  description: "Just kidding, it is",
})


state.create({
  type: "task",
  parent: pr,
  title: "llamar a jesus",
  description: "Si señor",
  percentage: 20,
})


// const ts = state.createTask({
//   title: "otra tarea",
//   description: "Si señor",
//   percentage: 100,
// }, pr)

// state.createTask({
//   title: "subtarea1",
//   description: "Si señor",
//   percentage: 10,
// }, ts)

// const s3 = state.createTask({
//   title: "subtarea3",
//   description: "Si señor",
//   percentage: 0,
// }, ts)

// const s2 = state.createTask({
//   title: "subtarea2",
//   description: "Si señor",
//   percentage: 60,
// }, ts)

// state.update({
//   id: ts,
//   type: "task",
//   title: "como?",
// })

// let timeoutId: number | null = null;

// function startTimer() {
//   const startTime = Date.now();
  
//   const timeoutHandler = () => {
//     if (Date.now() - startTime >= 2000) {
//       state.moveRelativeTo({ id: s3 }, { type: 'after', base: { id: s2 } })
//       window.cancelAnimationFrame(timeoutId!);
//     } else {
//       timeoutId = requestAnimationFrame(timeoutHandler);
//     }
//   };

//   timeoutId = requestAnimationFrame(timeoutHandler);
// }

// startTimer();