import { LoroDoc, type TreeID } from "loro-crdt";
import { FractosState, type Metadata } from "../../lib/state";
import { FractosView, type __Project, type __Task, type FractosRenderer, type FractosViewState } from "../../lib/view";

class Simple implements FractosRenderer {
  task(data: Metadata): __Task {
    const __root = document.createElement("div");
    const __title = document.createElement("h3");
    const __percentage = document.createElement("span");
    const __description = document.createElement("p");
    const __tasks = document.createElement("div");
    
    __title.innerText = data.title || "";
    __description.innerText = data.description || "";
    __percentage.innerText = `${data.percentage || 0}%`;
    
    __root.append(__title, __percentage, __description, __tasks)
    __root.classList.add("task")
    
    return {
      self: __root,
      tasks: __tasks,
      title: (title) => { __title.innerText = title },
      description: (description) => { __description.innerText = description },
      percentage: (value) => { __percentage.innerText = `${value}%` },
    }
  }
  
  project(data: Metadata): __Project {
    const __root = document.createElement("div");
    const __title = document.createElement("h1");
    const __percentage = document.createElement("span");
    const __description = document.createElement("p");
    const __tasks = document.createElement("div");
    
    __title.innerText = data.title || "";
    __description.innerText = data.description || "";
    __percentage.innerText = `${data.percentage || 0}%`;
    
    __root.append(__title, __percentage, __description, __tasks)
    
    return {
      self: __root,
      tasks: __tasks,
      title: (title) => { __title.innerText = title },
      description: (description) => { __description.innerText = description },
      percentage: (value) => { __percentage.innerText = `${value}%` },
    }
  }
}

class AllOpen implements FractosViewState {
  constructor() { }
  
  show = {
    children (id: TreeID): boolean {
      return true
    },
    description (id: TreeID): boolean {
      return true
    },
  };
}

const doc = new LoroDoc()

const state = new FractosState({ doc });
// const view = new FractosView({
//   state: state,
//   parent: document.querySelector(".view")!,
// })


const pr = state.createProject({
  title: "this is not a project",
  description: "Just kidding, it is",
})


state.createTask({
  title: "llamar a jesus",
  description: "Si señor",
  percentage: 20,
}, pr)


const ts = state.createTask({
  title: "otra tarea",
  description: "Si señor",
  percentage: 100,
}, pr)

state.createTask({
  title: "subtarea1",
  description: "Si señor",
  percentage: 10,
}, ts)

state.createTask({
  title: "subtarea3",
  description: "Si señor",
  percentage: 0,
}, ts)

state.createTask({
  title: "subtarea2",
  description: "Si señor",
  percentage: 60,
}, ts)

const view = new FractosView({
  state: state,
  parent: document.querySelector(".view")!,
  render: new Simple(),
  viewState: new AllOpen(),
})

