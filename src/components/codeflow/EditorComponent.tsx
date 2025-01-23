import { Editor } from "@monaco-editor/react";
import { useCallback, useState } from "react";

export default function EditorComponent() {
  const [code, setCode] = useState<string>("");

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  }, []);

  function handleEditorDidMount(editor: any, monaco: any) {
    console.log('onMount: the editor instance:', editor);
    console.log('onMount: the monaco instance:', monaco);
  }

  function handleEditorWillMount(monaco: any) {
    console.log('beforeMount: the monaco instance:', monaco);
  }

  function handleEditorValidation(markers: any) {
    console.log(markers, "marker");
  }

  return (
    <div className="w-full h-full flex-grow items-center justify-center p-2">
      <Editor
        height="100%"
        width="100%"
        defaultLanguage="javascript"
        defaultValue="// some comment"
        value={code}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        beforeMount={handleEditorWillMount}
        onValidate={handleEditorValidation}
      />
    </div>
  );
}
