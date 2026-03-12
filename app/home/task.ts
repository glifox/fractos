import { LoroDoc } from "loro-crdt";
import { FractosState } from "../../src/state/_state";
import { Project } from "../../src/state/project";
import { FractosView } from "../../src/view/_view";
import { HtmlRenderer } from "../lib/renderer";

const mainpanel = document.getElementById("main-panel")!;

const doc = new LoroDoc()

const tree = doc.getTree("root");
const state = new FractosState(doc, tree);
const pr = Project.new(tree.createNode(), {
  title: "Project name",
  description: "Description"
});

doc.commit();
const view = new FractosView(
  state,
  {
   mode: { type: "selection", project: pr },
   renderer: new HtmlRenderer(mainpanel, state),
} );

pr.createTask(
  {
    description: "prueba",
    title: "testimonio"
  }
)
doc.commit();
