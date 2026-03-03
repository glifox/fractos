
export enum Types {
  PROJECT = "Project",
  TASK = "Task",
}

export type ProjectData = {
  title: string,
  description: string,
};

export type TaskData = {
  title: string,
  description: string,
  percentage?: number,
}
