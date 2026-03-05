import { LoroDoc } from "loro-crdt";
import { Editor } from "./editor";
import { Project } from "../src/state/project";
import type { EditorView } from "codemirror";
import { State } from "../src/state/_state";
import { View } from "../src/view/_view";
import { Debuger } from "./rederer";
const log = (obj: Object) => { return Editor(JSON.stringify(obj, null, 2)) }
const change = (editor: EditorView, obj: Object) => {
  editor.dispatch({ changes: { from: 0, insert: JSON.stringify(obj, null, 2), to: ed.state.doc.length }})
}

const doc = new LoroDoc()

const tree = doc.getTree("root");
const state = new State(tree);
const pr = Project.new(tree.createNode(), {
  title: "Project name",
  description: "Description"
});

const view = new View(
  state,
  new Debuger(log([])),
  pr.id,
);

doc.commit();

const last = pr.createTask({
  title: "This is a task",
  description: "This is the description of the task"
})
doc.commit();

last.createTask({
  title: "this is a subtask",
  description: "This is the descriptio of the subtask",
  percentage: 20,
});
doc.commit();

log(doc.toJSON())

const percentages: any = {}
const ed = log({ percentages });

pr.percentage((id, per) => {
  percentages[id] = per;
  change(ed, { percentages })
})
doc.commit();

const data = last.metadata;
data.percentage = 100;
last.update({ task: data })

const new_percentages: any = {}
pr.percentage((id, per) => {
  new_percentages[id] = per;
  change(ed, { percentages, new: { json: doc.toJSON(), new_percentages } })
})
doc.commit();