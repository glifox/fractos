import { Editor } from "./editor";
const log = (obj: Object) => { Editor(JSON.stringify(obj, null, 2)) }







log({testing: "test"})