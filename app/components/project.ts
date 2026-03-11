import { catppuccinMocha } from "@catppuccin/codemirror";
import { json } from "@codemirror/lang-json";
import { EditorState } from "@codemirror/state";
import { EditorView, minimalSetup } from "codemirror";
import { gnosis } from "@glifox/gnosis";

export class HProject extends HTMLElement {
  $task: HTMLDivElement;
  etitle: EditorView;
  description: EditorView;
  
  constructor() {
    super()
    
    const $title = document.createElement("h2");
    const $description = document.createElement("div");
    this.$task = document.createElement("div");
    
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.append($title, $description, this.$task);
    
    this.etitle = new EditorView({
      doc: "",
      extensions: [
        minimalSetup,
        gnosis(),
        catppuccinMocha,
        EditorState.transactionFilter.of(tr => tr.newDoc.lines > 1 ? [] : [tr]),
      ],
      parent: $title,
    })
    
    this.description = new EditorView({
      doc: "",
      extensions: [
        minimalSetup,
        gnosis(),
        catppuccinMocha,
      ],
      parent: $description,
    })
  }
  
  changeDescriton(description: string) {
    if (this.description.state.doc.toString() === description) return;
    this.description.dispatch({ changes: { from: 0, insert: description, to: this.description.state.doc.length }})
  }
  
  changeTitle(description: string) {
    if (this.etitle.state.doc.toString() === description) return;
    this.etitle.dispatch({ changes: { from: 0, insert: description, to: this.etitle.state.doc.length }})
  }
  
  register() {
    this.description.contentDOM.addEventListener("focusout", (ev: FocusEvent) => {
      console.info("focuse lost:", ev);
    })
  }
}

if (!customElements.get('h-project')) {
  customElements.define('h-project', HProject);
}
