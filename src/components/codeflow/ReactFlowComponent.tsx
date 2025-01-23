import React, { useCallback, useState } from "react";
import ReactFlow, { addEdge, Background, Connection, Controls, Edge, MarkerType, Node, ReactFlowInstance, useEdgesState, useNodesState } from "reactflow";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import 'reactflow/dist/style.css';
import '../../styles/reactflow.css';
import umlNode from "./UmlNode";
import { NodeType, ConnectionType, NodeData, Visibility } from "@/types/nodeData";
import { ConnectionTypeSelector } from "./ConnectionTypeSelector";
import { customAlphabet } from 'nanoid';

const proOptions = { hideAttribution: true };

const nodeTypes = {
    umlNode: umlNode,
};

const generateId = () => {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const nanoid = customAlphabet(alphabet, 7);
  return nanoid();
};

export default function ReactFlowComponent({ onNodeChange }: { onNodeChange: (node: NodeData) => void }) {
    

    const initialNodes: Node[] = [{
        id: '1',
        position: { x: 0, y: 0 },
        data: {
            node: {
                id: '1',
                name: 'MyClass',
                type: NodeType.CLASS,
                properties: [{
                    isStatic: false,
                    name: 'id',
                    type: 'string',
                    visibility: Visibility.PRIVATE
                }],
                methods: [{
                    isStatic: false,
                    name: 'getId',
                    returnType: 'string',
                    parameters: [],
                    visibility: Visibility.PUBLIC
                }],
                position: { x: 0, y: 0 }
            },
            onChange: (node: NodeData) => handleNodeChange(node)
        },
        type: 'umlNode'
    }, {
        id: "2",
        type: "umlNode", // Use the custom node type
        position: { x: 100, y: 100 },
        data: {
            onChange: (node: NodeData) => handleNodeChange(node),
            node: {

                id: "2",
                name: "Person",
                type: NodeType.CLASS,
                properties: [
                    { isStatic: false,name: "name", type: "String", visibility: "+" },
                    { isStatic: false,name: "age", type: "int", visibility: "-" },
                ],
                methods: [
                    {isStatic: false,
                        name: "getName",
                        returnType: "String",
                        parameters: [],
                        visibility: Visibility.PUBLIC,
                    },
                    {isStatic: false,
                        name: "setAge",
                        returnType: "void",
                        parameters: [{ name: "age", type: "int" }],
                        visibility: Visibility.PUBLIC,
                    },
                ],
            }
        },
    },
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
  const [pendingConnection, setPendingConnection] = useState<{
    connection: Connection;
    position: { x: number; y: number }
  } | null>(null);

  const onInit = (reactFlowInstance: ReactFlowInstance) => reactFlowInstance.zoomTo(0.8);

  const onConnect = useCallback(
    (params: Connection) => {
      setPendingConnection({
        connection: params,
        position: { x: 0, y: 0 }, // You'll need to calculate this position
      });
    },
    []
  );

  const handleConnectionTypeSelect = (type: ConnectionType) => {
    if (pendingConnection) {
      const newEdge: Edge = {
        ...pendingConnection.connection,
        source: pendingConnection.connection.source!,
        target: pendingConnection.connection.target!,
        id: generateId(),
        type: 'smoothstep',
        data: { connectionType: type },
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
      };
      setEdges((eds) => addEdge(newEdge, eds));
      setPendingConnection(null);
    }
  };

  const handleConnectionCancel = useCallback(() => {
    setPendingConnection(null);
  }, []);

  const handleNodeChange = (newData: NodeData) => {
    setNodes(nds => {
      const index = nds.findIndex(node => node.id === newData.id);
      if (index === -1) return nds;
      nds[index].data.node = newData;
      return [...nds];
    });
    onNodeChange(newData);
  };

  const addNode = (type: NodeType) => {
    const id = generateId();
    const newNode = {
      id: id,
      position: { x: Math.random() * 500, y: Math.random() * 300 },
      type: 'umlNode',
      data: {
        onChange: (node: NodeData) => handleNodeChange(node),
        node: {
          id: id,
          name: 'MyClass',
          type: type,
          properties: [{
            isStatic: false,
            name: 'id',
            type: 'string',
            visibility: Visibility.PRIVATE
          }],
          methods: [{
            isStatic: false,
            name: 'getId',
            returnType: 'string',
            parameters: [],
            visibility: Visibility.PUBLIC
          }],
          position: { x: 0, y: 0 }
        }
      }
    };
    setNodes([...nodes, newNode]);
  };

  return (
    <div className="w-full h-full flex-grow items-center justify-center p-2">
      <div className="react-flow-wrapper relative">
        {pendingConnection && (
          <ConnectionTypeSelector
            position={pendingConnection.position}
            onSelect={handleConnectionTypeSelect}
            onCancel={handleConnectionCancel}
          />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="absolute top-2 left-2 z-50">Add</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="start"
            sideOffset={4}
          >
            <DropdownMenuItem onSelect={() => addNode(NodeType.CLASS)}>
              Class
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => addNode(NodeType.INTERFACE)}>
              Interface
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ReactFlow
          fitView
          onInit={onInit}
          proOptions={proOptions}
          className="bg-white"
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgesDelete={(edgesToDelete) => { console.log('delete edge', edgesToDelete) }}
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}
