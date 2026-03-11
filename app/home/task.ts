import { LoroDoc } from "loro-crdt";
import { State } from "../../src/state/_state";
import { Project } from "../../src/state/project";
import { View } from "../../src/view/_view";
import { HtmlRenderer } from "../renderer";

const mainpanel = document.getElementById("main-panel")!;

const doc = new LoroDoc()

const tree = doc.getTree("root");
const state = new State(tree);
const pr = Project.new(tree.createNode(), {
  title: "Project name",
  description: "Description"
});

doc.commit();
const view = new View(
  state,
  {
   mode: { type: "selection", project: pr },
   renderer: new HtmlRenderer(mainpanel),
} );

pr.createTask(
  {
    description: "prueba",
    title: "testimonio"
  }
)
doc.commit();
