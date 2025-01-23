import { useCallback } from 'react';
import ReactFlow, {MarkerType,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge
} from 'reactflow';

import 'reactflow/dist/style.css';


const initBgColor = '#c9f1dd';

const initialNodes = [

  
  { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
  { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
];

// const nodeTypes = {
//     selectorNode: ColorSelectorNode,
//   };

const initialEdges = [{ id: 'e1-2', source: '1', target: '2' ,type: 'smoothstep',
    markerEnd: {
        type: MarkerType.Arrow,
        width: 20,
        height: 20,
        color: '#FF0072',
      },
      style: {
        strokeWidth: 2,
        stroke: '#FF0072',
      },
}];

export default function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
    <ReactFlow
      nodes={nodes}
      edges={edges}
    //   nodeTypes={nodeTypes}
      fitView
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
    >
      <Controls />
      <Background />
    </ReactFlow>
    </div>
  );
}



// export default function DemoEditor() {
//     const [value, setValue] = useState(0);

//     // function handleEditorChange(value: any, event: any) {
//     //   // here is the current value
//     //   console.log(value);
      
//     // }
  
//     // function handleEditorDidMount(editor, monaco) {
//     //   console.log('onMount: the editor instance:', editor);
//     //   console.log('onMount: the monaco instance:', monaco);
//     // }
  
//     // function handleEditorWillMount(monaco) {
//     //   console.log('beforeMount: the monaco instance:', monaco);
//     // }
  
//     // function handleEditorValidation(markers) {
//     //   // model markers
//     //   // markers.forEach(marker => console.log('onValidate:', marker.message));
//     //   console.log(markers,"marker");
      
//     // }
  
//     return (
//         <>
//       <Editor
//         height="50vh"
//         width="50vw"
//         defaultLanguage="javascript"
//         defaultValue="// some comment"
//         // onChange={handleEditorChange}
//         // onMount={handleEditorDidMount}
//         // beforeMount={handleEditorWillMount}
//         // onValidate={handleEditorValidation}
//         />
//         <div style={{width:'100%', height:'100vh'}}>

//       <Flow></Flow>
//         </div>
//         </>
//     );
//   }