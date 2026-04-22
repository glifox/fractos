import { LoroDoc, type TreeID } from "loro-crdt";
import { FractosState, type Metadata } from "../../lib/state";
import { FractosView, type __Project, type __Task, type FractosRenderer, type ShowState } from "../../lib/view_old";

class Simple implements FractosRenderer {
  changeState(el: __Task | __Project, state: ShowState): void {
    
  } 
  
  task(data: Metadata): __Task {
    const __root = document.createElement("div");
    const __index = document.createElement("h3");
    const __title = document.createElement("h3");
    const __percentage = document.createElement("span");
    const __description = document.createElement("p");
    const __tasks = document.createElement("div");
    
    __index.innerText = `${data.index}`;
    __title.innerText = `${data.title}`;
    __description.innerText = data.description || "";
    __percentage.innerText = `${data.percentage || 0}%`;
    
    __root.append(__index, __title, __percentage, __description, __tasks)
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
    
    __title.innerText = `(${data.index}) - ${data.title}`;
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

const doc = new LoroDoc()

const state = new FractosState({ doc });
const view = new FractosView({
  state: state,
  parent: document.querySelector(".view")!,
  render: new Simple(),
})


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

const s3 = state.createTask({
  title: "subtarea3",
  description: "Si señor",
  percentage: 0,
}, ts)

const s2 = state.createTask({
  title: "subtarea2",
  description: "Si señor",
  percentage: 60,
}, ts)

state.update({
  id: ts,
  type: "task",
  title: "como?",
})

let timeoutId: number | null = null;

function startTimer() {
  const startTime = Date.now();
  
  const timeoutHandler = () => {
    if (Date.now() - startTime >= 2000) {
      state.moveRelativeTo({ id: s3 }, { type: 'after', base: { id: s2 } })
      window.cancelAnimationFrame(timeoutId!);
    } else {
      timeoutId = requestAnimationFrame(timeoutHandler);
    }
  };

  timeoutId = requestAnimationFrame(timeoutHandler);
}

startTimer();