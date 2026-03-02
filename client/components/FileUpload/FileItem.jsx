import { Trash2 } from "lucide-react";
import FilledFile from "../icons/FilledFile";

export const FileItem = ({ filename,onRemove }) => {
  return (
    <div className="flex overflow-hidden flex-wrap gap-2.5 items-center px-4 py-3.5 w-full bg-fuchsia-50 rounded-lg">
      <FilledFile size={20}/>
      <div className="flex-1 shrink self-stretch my-auto basis-0">
        <p className="text-semibold">{filename}</p>
      </div>
      <button
        onClick={onRemove}
        className="border-none bg-transparent p-0 cursor-pointer"
        aria-label="Remove file"
      >
        <Trash2 size={20} color="red"/>
      </button>
    </div>
  );
};