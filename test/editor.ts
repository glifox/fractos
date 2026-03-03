import { json } from "@codemirror/lang-json";
import { EditorView, basicSetup } from "codemirror";
import { catppuccinMocha } from "@catppuccin/codemirror";

export const Editor = (text: string) => {
  const view = new EditorView({
    doc: text,
    extensions: [
      json(),
      basicSetup,
      catppuccinMocha,
      EditorView.editable.of(false),
    ],
    parent: document.querySelector(".editor")!,
  });

  return view;
};
