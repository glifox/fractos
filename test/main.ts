import { LoroDoc } from "loro-crdt";
import { Editor } from "./editor";
import { FractosState } from "../lib/lib";

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

const pr = state.create({
  type: "project",
  title: "this is not a project",
  description: "Just kidding, it is",
})

logger.change(doc.toJSON());

state.create({
  type: "task",
  title: "llamar a jesus",
  description: "Si señor",
  percentage: 20,
  parent: pr,
})

logger.change(doc.toJSON());

const tsk = state.create({
  type: "task", 
  title: "otra tarea",
  description: "Si señor",
  percentage: 0,
  parent: pr,
})

logger.change(doc.toJSON());

state.create({
  type: "task",
  parent: tsk,
  title: "",
  description: "",
  percentage: 12
})

logger.change({ update: "percentage", ...doc.toJSON()});