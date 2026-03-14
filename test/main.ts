import { LoroDoc } from "loro-crdt";
import { Editor } from "./editor";
import type { EditorView } from "codemirror";
import { FractosState } from "../lib/state";

const log = (obj: Object) => {
  const editor = Editor(JSON.stringify(obj, null, 2))
  
  return {
    change: (obj: Object) => {
      editor.dispatch({ changes: { from: 0, insert: JSON.stringify(obj, null, 2), to: editor.state.doc.length } })
    }
  }
}

const doc = new LoroDoc()

const state = new FractosState({doc});
doc.subscribe((e) => {
  log(e)
})

const logger = log(doc.toJSON());

const pr = state.createProject({
  title: "this is not a project",
  description: "Just kidding, it is",
})

logger.change(doc.toJSON());

state.createTask({
  title: "llamar a jesus",
  description: "Si señor",
}, pr)

logger.change(doc.toJSON());
