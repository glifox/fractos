import type { TreeID } from "loro-crdt";
import type { Metadata, ProjectData, TaskData } from "../src/state/types";
import type { Renderer } from "../src/view/renderer";
import type { EditorView } from "codemirror";


export class Debuger implements Renderer {
  stack: any[] = [];
  
  constructor(private editor: EditorView) { }
  
  private _update() {
    this.editor.dispatch({ changes: { from: 0, insert: JSON.stringify(this.stack, null, 2), to: this.editor.state.doc.length }})
  }
  
  createTask(element: TaskData & { target: TreeID; parent: TreeID; }): HTMLElement {
    this.stack.push({ create: element, type: "task" })
    this._update();
    return document.createElement("div");
  }
  
  createProject(element: ProjectData & { target: TreeID; }): HTMLElement {
    this.stack.push({ create: element, type: "project" })
    this._update();
    return document.createElement("div");
  }
  
  update(id: TreeID, metadata: Metadata): void {
    this.stack.push({ update: metadata, id });
    this._update();
  }
  
  delete(id: TreeID): void {
    this.stack.push({ delete: id });
    this._update();
  }
  move(target: TreeID, parent?: TreeID): void {
    this.stack.push({ move: target, to: parent });
    this._update();
  }
  
}