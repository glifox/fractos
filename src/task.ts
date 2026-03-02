import { LoroMap } from 'loro-crdt';
import { v4 as uuidv4 } from 'uuid';

export type TaskId = string;

export class Task {
  private _id: TaskId;
  private _title: string;
  private _description: string;
  private _percentage: number;
  private _subtasks: Task[];
  
  private constructor(
    id: TaskId,
    title: string,
    description: string,
    percentage: number,
    subtasks: Task[] | undefined
  ) {
    this._id = id;
    this._title =  title;
    this._description =  description;
    this._percentage = percentage;
    this._subtasks = subtasks || [];
  }
  
  get map(): LoroMap {
    const map = new LoroMap();
    
    map.set("id", this.id);
    map.set("title", this.title);
    map.set("description", this.description);
    map.set("percentage", this.percentage);
    
    let submaps = new LoroMap();
    for (const task of this.subtasks) {
      submaps.setContainer(task.id, task.map);
    }
    
    map.setContainer("subtasks", submaps);
    
    return map
  }
  
  get id() { return this._id }
  get title() { return this._title }
  get description() { return this._description }
  get percentage() { return this._percentage }
  get subtasks() { return this._subtasks }
  
  static new(
    title: string,
    description: string,
    subtasks: Task[] | undefined,
  ) {
    return new Task(uuidv4(), title, description, 0, subtasks)
  }
  
  static fromMap(map: LoroMap): Task {
    const id = map.get("id") as TaskId;
    const title = map.get("title") as string;
    const description = map.get("description") as string;
    const percentage = map.get("percentage") as number;
    const submaps = map.get("subtasks") as LoroMap;
    const subtasks: Task[] = [];
    
    for (const key of submaps.keys()) {
      subtasks.push(Task.fromMap(submaps.get(key) as LoroMap ))
    }
    
    return new Task(id, title, description, percentage, subtasks);
  }
}

