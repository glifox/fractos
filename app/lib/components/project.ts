import { gnosis } from "@glifox/gnosis";
import { EditorState } from "@codemirror/state";
import { EditorView, minimalSetup } from "codemirror";
import { catppuccinMocha } from "@catppuccin/codemirror";
import type { ProjectData } from "../../../src/state/types";


export class HProject {
  private __self: HTMLDivElement;
  __tasks: HTMLDivElement;
  __title: HTMLHeadingElement;
  __description: HTMLParagraphElement;
  
  private title: EditorView;
  private description: EditorView;
  
  constructor(
    meta: ProjectData,
    id: string
  ) {
    this.__self = document.createElement("div");
    this.__tasks = document.createElement("div");
    this.__title = document.createElement("h2");
    this.__description = document.createElement("div");
    
    this.title = new EditorView({
      doc: meta.title,
      extensions: [
        gnosis(),
        minimalSetup,
        catppuccinMocha,
        EditorState.transactionFilter.of(tr => tr.newDoc.lines > 1 ? [] : [tr]),
      ],
      parent: this.__title,
    })
    
    this.description = new EditorView({
      doc: meta.description,
      extensions: [
        gnosis(),
        minimalSetup,
        catppuccinMocha,
      ],
      parent: this.__description,
    })
    
    this.__self.id = id;
    this.__self.append(
      this.__title,
      this.__description,
    )
  }
  
  changeDescriton(description: string) { HProject.emitChange(this.description, description)}
  changeTitle(title: string) { HProject.emitChange(this.title, title) }
  
  private static emitChange(editor: EditorView, text: string) {
    if (editor.state.doc.toString() === text) return;
    editor.dispatch({ changes: { from: 0, insert: text, to: editor.state.doc.length }})
  }
  
  register() {
    this.description.contentDOM.addEventListener("focusout", (ev: FocusEvent) => {
      console.info("focuse lost:", ev);
    })
  }
  
  get elementDOM(): HTMLDivElement { return this.__self };
}
