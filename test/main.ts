import { LoroDoc } from "loro-crdt";
import { Editor } from "./editor";
import { Project } from "../src/state/project";
const log = (obj: Object) => { Editor(JSON.stringify(obj, null, 2)) }


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

const parent = tree.getNodeByID(last);
pr.createTask({
  title: "this is a subtask",
  description: "This is the descriptio of the subtask",
}, parent);

log(doc.toJSON())