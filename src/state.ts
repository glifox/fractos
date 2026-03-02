import { LoroDoc, LoroMap } from "loro-crdt";
import { type TaskId, Task } from "./task";

export class LoroTask {
  private _doc: LoroDoc;
  private _map: LoroMap;
  
  constructor(loro: LoroDoc | undefined) {
    this._doc = loro || new LoroDoc();
    this._map = this._doc.getMap("root");
  }
  
  addTask(task: Task) {
    this._map.setContainer(task.id, task.map);
  }
  
  getTask() {
    this._map.
  }
  
}

