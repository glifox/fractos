
export enum Types {
  PROJECT = "project",
  TASK = "task",
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