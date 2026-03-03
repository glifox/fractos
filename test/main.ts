import { LoroDoc } from "loro-crdt";
import { Editor } from "./editor";
import { Project } from "../src/state/project";
import type { EditorView } from "codemirror";
const log = (obj: Object) => { return Editor(JSON.stringify(obj, null, 2)) }
const change = (editor: EditorView, obj: Object) => {
  editor.dispatch({ changes: { from: 0, insert: JSON.stringify(obj, null, 2), to: ed.state.doc.length }})
}

const doc = new LoroDoc()

const tree = doc.getTree("root");


const pr = Project.new(tree.createNode(), {
  title: "Project name",
  description: "Description"
})

const last = pr.createTask({
  title: "This is a task",
  description: "This is the description of the task"
})

last.createTask({
  title: "this is a subtask",
  description: "This is the descriptio of the subtask",
  percentage: 20,
});

log(doc.toJSON())

const percentages: any = {}
const ed = log({ percentages });

pr.percentage((id, per) => {
  percentages[id] = per;
  change(ed, { percentages })
})