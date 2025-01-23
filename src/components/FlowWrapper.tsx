import ReactFlow, { addEdge, Background, Controls, MarkerType, useEdgesState, useNodesState } from 'reactflow';
import 'reactflow/dist/style.css';
import '../styles/reactflow.css';
import { useCallback } from 'react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

const proOptions = { hideAttribution: true };

export default function FlowWrapper() {
    const initialNodes = [
        { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
        { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
        { id: '3', position: { x: 0, y: 200 }, data: { label: '3' } },
    ];

    const initialEdges = [{
        id: 'e1-2', source: '1', target: '2', type: 'smoothstep',
        markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#FF0072',
        },
        style: {
            strokeWidth: 2,
            stroke: '#FF0072',
        },
    }];
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const addNode = () => {
        const newNode = {
            id: (nodes.length + 1).toString(),
            position: { x: Math.random() * 500, y: Math.random() * 300 },
            data: { label: `Node ${nodes.length + 1}` }
        };
        setNodes([...nodes, newNode]);
    };

    return (
        <div className="react-flow-wrapper relative">

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="absolute top-2 left-2 z-50">Add</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    side="bottom"
                    align="start"
                    sideOffset={4}
                >
                    <DropdownMenuItem onSelect={addNode}>
                        Class
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={addNode}>
                        Interface
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <ReactFlow
                fitView
                proOptions={proOptions}
                className="bg-white"
                nodes={nodes}
                edges={edges}
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
