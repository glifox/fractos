import type { TreeID } from "loro-crdt";
import type { FractosNodeType, NodeType, FractosNode } from "../state/node";
import type { Compositor } from "./compositor";
import type { FractosView } from "./view";


export type ViewMode = ShowAll | Selected | None;
export type ShowAll = { type: "all" };
export type Selected = { type: "selected", project: TreeID };
export type None = { type: "none" }

export type ViewModeHandlers = {
  [K in ViewMode["type"]]: (mode: Extract<ViewMode, { type: K; }>) => void;
};

export interface Node<K extends keyof FractosNodeType> {
  type: K;
  treeid: TreeID;
  element: HTMLElement;
  compositor: Compositor;
  showChildren: boolean;

  set<P extends keyof FractosNodeType[K]>(key: keyof FractosNodeType[K], value: FractosNodeType[K][P]): void;
  updateIndex(): void;
}
export type Renderer = {
  [K in NodeType]: (view: FractosView, node: FractosNode) => Node<K>;
};
