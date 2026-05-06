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
  title: "master project",
  description: "Simple description",
})

logger.change(doc.toJSON());

const tk1 = state.create({
  type: "task",
  title: "Task 1",
  description: "",
  percentage: 20,
  parent: pr,
})

logger.change(doc.toJSON());

const tsk = state.create({
  type: "task", 
  title: "Task 2",
  description: "",
  percentage: 0,
  parent: pr,
})

logger.change(doc.toJSON());

state.create({
  type: "task",
  parent: tsk,
  title: "Subtask 1",
  description: "",
  percentage: 12
})

const st1 = state.create({
  type: "task",
  parent: tsk,
  title: "Subtask 2",
  description: "",
  percentage: 12
})

state.create({
  type: "task",
  parent: tsk,
  title: "Subtask 3",
  description: "",
  percentage: 12
})

state.create({
  type: "task",
  parent: st1,
  title: "Sub Subtask 1",
  description: "",
  percentage: 12
})

logger.change({ update: "percentage", ...doc.toJSON() });

state.copy({ id: tsk }, { id: tk1 })

logger.change({ action: "copy", ...doc.toJSON() });