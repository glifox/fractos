import type { TreeID } from "loro-crdt";
import { Compositor, type FractosView, type Node } from "../../lib/lib";
import type { TaskData, FractosNodeType, FractosNode } from "../../lib/state/node";

export class Task implements Node<'task'> {
  type = "task" as const;

  treeid: `${number}@${number}`;
  element: HTMLElement;
  content: HTMLElement;
  childs: HTMLElement;
  delete: HTMLButtonElement;
  showChildren: boolean = true;
  compositor: Compositor;
  
  constructor(private view: FractosView, private node: FractosNode) {
    this.treeid = this.node.treeid,
    this.element = document.createElement('div');
    this.content = document.createElement('span');
    this.delete = document.createElement('button');
    this.childs = document.createElement('div');
    
    this.compositor = new Compositor(this.childs);
    
    const up = document.createElement('button');
    const down = document.createElement('button');

    this.content.innerHTML = `-> ${this.node.index} - ${this.node.get('type')}:${this.node.get('title')}:${this.node.get('description')}:${this.node.get('percentage')}`;
    this.delete.innerText = 'delete';
    up.innerText = 'up';
    down.innerText = 'down';

    this.showChildren = (this.node.index == 0);

    this.element.append(this.content, this.delete, up, down, this.childs);
    this.element.dataset.treeid = this.treeid;

    this.delete.addEventListener('click', () => {
      this.view.state.delete(this.treeid);
    });

    up.addEventListener('click', () => {
      const prev = this.element.previousElementSibling as HTMLElement;
      if (!prev) return;

      const id = prev.dataset.treeid as TreeID;

      this.view.state.moveRelativeTo(this.node, { type: 'before', base: { id } });
    });
    down.addEventListener('click', () => {
      const next = this.element.nextElementSibling as HTMLElement;
      if (!next) return;

      const id = next.dataset.treeid as TreeID;

      this.view.state.moveRelativeTo(this.node, { type: 'after', base: { id } });
    });
  }
  
  set<P extends keyof TaskData>(key: keyof TaskData, value: TaskData[P]): void {
    console.info("key:", key);
    this.content.innerHTML = `-> ${this.node.index} - ${this.node.get('type')}:${this.node.get('title')}:${this.node.get('description')}:${this.node.get('percentage')}`;
  }

  updateIndex(): void {
    this.content.innerHTML = `-> ${this.node.index} - ${this.node.get('type')}:${this.node.get('title')}:${this.node.get('description')}:${this.node.get('percentage')}`;
    this.showChildren = (this.node.index == 0);
  }

}
