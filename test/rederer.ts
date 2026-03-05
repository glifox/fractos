import type { TreeID } from "loro-crdt";
import type { Project } from "../src/state/project";
import type { Task } from "../src/state/tasks";
import type { Metadata } from "../src/state/types";
import type { Renderer } from "../src/view/renderer";
import type { EditorView } from "codemirror";


export class Debuger implements Renderer {
  stack: any[] = [];
  
  constructor(private editor: EditorView) { }
  
  private _update() {
    this.editor.dispatch({ changes: { from: 0, insert: JSON.stringify(this.stack, null, 2), to: this.editor.state.doc.length }})
  }
  
  createTask(node: Task): HTMLElement {
    let json = node.node.toJSON();
    json.children = []
    this.stack.push({ create: json, type: "task" })
    this._update();
    return document.createElement("div");
  }
  createProject(node: Project): HTMLElement {
    let json = node.node.toJSON();
    json.children = []
    this.stack.push({ create: json, type: "project" })
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