import { LoroDoc, type TreeID, type TreeNodeJSON } from "loro-crdt";
import { FractosState, FractosView } from "../../lib/lib";
import { Project } from "./Project";
import { Task } from "./Task";



const doc = new LoroDoc()

const state = new FractosState({ doc });
const view = new FractosView({
  state: state,
  parent: document.querySelector(".view")!,
  renderer: {
    project: (view, node) => {
      return new Project(view, node)
    },
    task: (view, node) => {
      return new Task(view, node)
    }
  },
})


const pr = state.create({
  type: "project",
  title: "this is not a project",
  description: "Just kidding, it is",
})


state.create({
  type: "task",
  parent: pr,
  title: "task 1",
  description: "Si señor",
  percentage: 20,
})

state.create({
  type: "task",
  parent: pr,
  title: "task 2",
  description: "Si señor",
  percentage: 20,
})

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
async function createProjects() {
  let id: any = null;
  for (let i = 0; i < 20; i++) {
    
    // Ejecuta la creación del proyecto
    const id_ = state.create({
      type: "project",
      title: `Project [${i}]`,
      description: "-- Desc --",
    });

    // Espera 100ms antes de la siguiente iteración
    await wait(10); 
    
    if (i === 19) id = id_;
  }
  
  await wait(1000); 
  state.moveRelativeTo({ id: id as TreeID }, { type: "after", base: { id: pr } }  )
}

createProjects();
// const ts = state.createTask({
//   title: "otra tarea",
//   description: "Si señor",
//   percentage: 100,
// }, pr)

// state.createTask({
//   title: "subtarea1",
//   description: "Si señor",
//   percentage: 10,
// }, ts)

// const s3 = state.createTask({
//   title: "subtarea3",
//   description: "Si señor",
//   percentage: 0,
// }, ts)

// const s2 = state.createTask({
//   title: "subtarea2",
//   description: "Si señor",
//   percentage: 60,
// }, ts)

// state.update({
//   id: ts,
//   type: "task",
//   title: "como?",
// })

// let timeoutId: number | null = null;

// function startTimer() {
//   const startTime = Date.now();
  
//   const timeoutHandler = () => {
//     if (Date.now() - startTime >= 2000) {
//       state.moveRelativeTo({ id: s3 }, { type: 'after', base: { id: s2 } })
//       window.cancelAnimationFrame(timeoutId!);
//     } else {
//       timeoutId = requestAnimationFrame(timeoutHandler);
//     }
//   };

//   timeoutId = requestAnimationFrame(timeoutHandler);
// }

// startTimer();