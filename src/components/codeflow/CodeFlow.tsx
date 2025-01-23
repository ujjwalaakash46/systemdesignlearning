import { Editor } from "@monaco-editor/react";
import { useCallback, useEffect, useState } from "react";
import ReactFlow, { addEdge, Background, Connection, Controls, Edge, MarkerType, Node, ReactFlowInstance, useEdgesState, useNodesState } from "reactflow"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import 'reactflow/dist/style.css';
import '../../styles/reactflow.css';
import umlNode from "./UmlNode";
import { NodeType, ConnectionType, NodeData, Visibility, Property, Method } from "@/types/nodeData";
import { ConnectionTypeSelector } from "./ConnectionTypeSelector";
import { customAlphabet } from 'nanoid';
import CustomEdge from './CustomEdge';
import { MdContentCopy } from "react-icons/md";

const proOptions = { hideAttribution: true };

const nodeTypes = {
    umlNode: umlNode,
};

const edgeTypes = {
    custom: CustomEdge,
};

const generateId = () => {
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const nanoid = customAlphabet(alphabet, 7);
    return nanoid();
};



export default function CodeFlow() {


    const onInit = (reactFlowInstance: ReactFlowInstance) => reactFlowInstance.zoomTo(0.8);

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
                    { isStatic: false, name: "name", type: "String", visibility: Visibility.PRIVATE },
                    { isStatic: false, name: "age", type: "int", visibility: Visibility.PROTECTED },
                ],
                methods: [
                    {
                        isStatic: false,
                        name: "getName",
                        returnType: "String",
                        parameters: [],
                        visibility: Visibility.PUBLIC,
                    },
                    {
                        isStatic: false,
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

    const initialEdges: Edge[] = [{
        id: 'e1-2', source: '2', target: '1', type: 'smoothstep',
        style: {
            strokeWidth: 2,
        },
        markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#666666',
        },

        animated: true,
        data: { connectionType: ConnectionType.INHERITANCE },
        // style: {
        //     strokeWidth: 2,
        //     stroke: '#FF0072',
        // },
    }];

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [pendingConnection, setPendingConnection] = useState<{
        connection: Connection;
        position: { x: number; y: number }
    } | null>(null);
    const [code, setCode] = useState<string>("");
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    const compileUmlToCode = () => {
        let code = "";
        nodes.forEach(node => {
            let relatedEdges = edges.filter(edge => edge.source === node.id);
            let implementsName = relatedEdges.filter(edge => edge.data.connectionType === ConnectionType.IMPLEMENTATION).map(edge => nodes.find(n => n.id === edge.target)?.data.node.name).join(", ");
            let extendsName = relatedEdges.filter(edge => edge.data.connectionType === ConnectionType.INHERITANCE).map(edge => nodes.find(n => n.id === edge.target)?.data.node.name).join(", ");

            code += `class ${node.data.node.name} ${extendsName ? 'extends ' + extendsName : ''} ${implementsName ? 'implements ' + implementsName : ''} {\n`;

            node.data.node.properties.forEach((property: Property) => {
                code += ` ${property.isStatic ? 'static ' : ' '}${property.visibility} ${property.type} ${property.name};\n`;
            });
            code += "\n";
            node.data.node.methods.forEach((method: Method) => {
                code += `  ${method.visibility} ${method.returnType} ${method.name}(`;

                code += method.parameters.map(parameter => `${parameter.type} ${parameter.name}`).join(", ");
                code += " ){\n";
                code += "  }\n";
            });

            code += "}\n";
        });
        setCode(code);
    }

    const onConnect = useCallback(
        (params: Connection) => {
            // Always ensure source is from bottom and target is from top
            const sourceNode = nodes.find(n => n.id === params.source);
            const targetNode = nodes.find(n => n.id === params.target);

            if (sourceNode && targetNode) {
                // If connection is made from top to bottom, swap the direction
                if (params.sourceHandle?.startsWith('top') || params.targetHandle?.startsWith('bottom')) {
                    setPendingConnection({
                        connection: {
                            ...params,
                            source: params.target,
                            target: params.source,
                            sourceHandle: params.sourceHandle,
                            targetHandle: params.targetHandle,
                        },
                        position: { x: 0, y: 0 },
                    });
                } else {
                    setPendingConnection({
                        connection: {
                            ...params,
                            sourceHandle: params.sourceHandle,
                            targetHandle: params.targetHandle,
                        },
                        position: { x: 0, y: 0 },
                    });
                }
            }
        },
        [nodes]
    );

    const isValidConnection = useCallback((connection: Connection) => {
        // Only allow connections from bottom to top
        return (
            connection.source !== connection.target && // No self connections
            (!connection.sourceHandle?.startsWith('top') && !connection.targetHandle?.startsWith('bottom')) // Enforce direction
        );
    }, []);

    const getEdgeStyle = (type: ConnectionType) => {
        const commonProps = {
            style: {
                strokeWidth: 2,
            },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
                color: '#666666',
            }
        };

        const edgeStyle = (() => {
            switch (type) {
                case ConnectionType.INHERITANCE:
                    return commonProps;
                case ConnectionType.IMPLEMENTATION:
                    return {
                        ...commonProps,
                        style: {
                            ...commonProps.style,
                            strokeDasharray: '5 5',
                        }
                    };
                case ConnectionType.COMPOSITION:
                    return {
                        ...commonProps,
                        markerEnd: 'diamondMarker'
                    };
                case ConnectionType.AGGREGATION:
                    return {
                        ...commonProps,
                        markerEnd: 'diamondMarker'
                    };
                case ConnectionType.DEPENDENCY:
                    return {
                        ...commonProps,
                        style: {
                            ...commonProps.style,
                            strokeDasharray: '3 3',
                        }
                    };
            }
        })();

        return {
            ...edgeStyle,
            type: 'custom', // Use our custom edge type
        };
    };

    const handleConnectionTypeSelect = (type: ConnectionType) => {
        if (pendingConnection) {
            const edgeStyle = getEdgeStyle(type);
            const newEdge: Edge = {
                ...pendingConnection.connection,
                source: pendingConnection.connection.source!,
                target: pendingConnection.connection.target!,
                id: generateId(),
                data: { connectionType: type },
                ...edgeStyle,
            };
            setEdges((eds) => addEdge(newEdge, eds));
            setPendingConnection(null);
        }
    };

    const handleConnectionCancel = useCallback(() => {
        setPendingConnection(null);
    }, []);

    const handleNodeChange = (newData: NodeData) => {
        setNodes((nds) => {
            const index = nds.findIndex(node => node.id === newData.id);
            if (index === -1) return nds;
            nds[index].data.node = newData;
            return [...nds];
        });
        
    };

    useEffect(() => {   // Update code when nodes change
        console.log('nodes changed', nodes);
        
        }, [nodes])

    const handleEditorChange = useCallback((value: string | undefined) => {
        if (value !== undefined) {
            setCode(value);
        }
        // Parse code and update nodes
        // const parsedNodes = CodeGenerator.parseTypeScriptCode(value!);
        // if (parsedNodes.length > 0) {
        //     setNodes(nds => nds.map(node => {
        //         const parsedNode = parsedNodes.find(n => n.name === node.data.name);
        //         return parsedNode ? { ...node, data: { ...node.data, ...parsedNode } } : node;
        //     }));
        // }
    }, []);

    function handleEditorDidMount(editor: any, monaco: any) {
        console.log('onMount: the editor instance:', editor);
        console.log('onMount: the monaco instance:', monaco);
    }

    function handleEditorWillMount(monaco: any) {
        console.log('beforeMount: the monaco instance:', monaco);
    }

    function handleEditorValidation(markers: any) {
        // model markers
        // markers.forEach(marker => console.log('onValidate:', marker.message));
        console.log(markers, "marker");

    }



    const addNode = (type: NodeType) => {
        const id = generateId();
        const newNode = {
            id: id,
            position: { x: Math.random() * 500, y: Math.random() * 300 }, type: 'umlNode',
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
        setNodes((nds) => [...nds, newNode]);
    };

    const [isConnecting, setIsConnecting] = useState(false); // Track connection state
    const [connectionStartNode, setConnectionStartNode] = useState(null);
    const [activeConnection, setActiveConnection] = useState<string | null>(null);

    const onConnectStart = useCallback((_event: any, { nodeId, handleId }: { nodeId: any, handleId: string | null }) => {
        setIsConnecting(true);
        setConnectionStartNode(nodeId);
        if (handleId?.startsWith('source-')) {
            setActiveConnection(handleId);
        }
    }, []);

    const onConnectStop = useCallback(() => {
        setIsConnecting(false);
        setConnectionStartNode(null);
        setActiveConnection(null);
    }, []);

    const isValidConnectionHandler = useCallback((connection: Connection) => {
        if (!isConnecting) return false; // Prevent connections if not dragging from a source
        if (connection.source === connection.target) return false;
        return connection.sourceHandle !== null && connection.targetHandle !== null;
    }, [isConnecting]);

    const duplicateNode = useCallback(() => {
        if (!selectedNode) return;

        const newId = generateId();
        const oldNode = selectedNode.data.node;

        const newNode = {
            id: newId,
            position: {
                x: selectedNode.position.x + 50,
                y: selectedNode.position.y + 50
            },
            type: 'umlNode',
            data: {
                onChange: (node: NodeData) => handleNodeChange(node),
                node: {
                    ...oldNode,
                    id: newId,
                    name: `${oldNode.name}_copy`,
                    position: { x: selectedNode.position.x + 50, y: selectedNode.position.y + 50 }
                }
            }
        };

        setNodes((nds) => [...nds, newNode]);
    }, [selectedNode]);

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);

    return <>
        <ResizablePanelGroup
            direction="horizontal"
            className="rounded-lg border w-full h-full"
        >
            <ResizablePanel defaultSize={80}>
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
                                <Button className="absolute top-2 left-2 z-20">Add</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="bottom"
                                align="start"
                                sideOffset={4}
                            >
                                {Object.values(NodeType).map((type) => (
                                    <DropdownMenuItem key={type} onSelect={() => addNode(type as NodeType)}>
                                        {type}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {/* <Button className="absolute top-12 left-2 z-20">Compile UML</Button> */}
                        {/* <div className="absolute top-12 left-2 flex items-center justify-center h-screen"> */}
                        <Button onClick={compileUmlToCode}
                            className="absolute top-12 left-2 z-20 group flex items-center px-4 py-2  font-semibold rounded-lg shadow-md transition-all duration-300 hover:pl-8 hover:pr-4"
                        >
                            <span className="absolute text-center px-2 left-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                To Code
                            </span>
                            <span className="transition-all duration-300 group-hover:opacity-0">
                                Complie
                            </span>
                        </Button>
                        {/* </div> */}
                        <svg width="0" height="0">
                            <defs>
                                <marker
                                    id="diamondMarkerFilled"
                                    viewBox="0 0 40 40"
                                    markerHeight={30}
                                    markerWidth={30}
                                    refX={5}
                                    refY={10}
                                >
                                    <path d="M 0 5 L 5 0 L 10 5 L 5 10 Z" fill="black" />
                                </marker>
                            </defs>
                        </svg>

                        <svg width="0" height="0">
                            <defs>
                                <marker
                                    id="diamondMarker"
                                    viewBox="0 0 40 40"
                                    markerHeight={30}
                                    markerWidth={30}
                                    refX={5}
                                    refY={10}
                                >
                                    <path
                                        d="M 0 5 L 5 0 L 10 5 L 5 10 Z"
                                        fill="white"
                                        stroke="black"
                                        strokeWidth="1.2"
                                    />
                                </marker>
                            </defs>
                        </svg>

                        <ReactFlow
                            fitView
                            onInit={onInit}
                            proOptions={proOptions}
                            className="bg-gray-900"
                            nodes={nodes}
                            edges={edges}
                            nodeTypes={nodeTypes}
                            edgeTypes={edgeTypes}
                            onConnectStart={onConnectStart}
                            // onconnec
                            // onConnectStop={onConnectStop}
                            onConnectEnd={onConnectStop}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            isValidConnection={isValidConnection}
                            onEdgesDelete={(edgesToDelete) => { console.log('delete edge', edgesToDelete) }}
                            snapToGrid={true}
                            connectionRadius={100}
                            connectOnClick={false}
                            defaultEdgeOptions={{
                                type: 'custom', // Set custom as default edge type
                                style: { stroke: '#666666' },
                                markerEnd: {
                                    type: MarkerType.ArrowClosed,
                                    color: '#666666',
                                }
                            }}
                            onNodeClick={onNodeClick}
                            onPaneClick={onPaneClick}
                            edgesUpdatable={true}
                            edgesFocusable={true}
                        >
                            <Controls />
                            <Background />
                        </ReactFlow>
                    </div>
                </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={20}>
                <div className="w-full h-full flex-grow items-center justify-center p-2">
                    <Editor
                        className=""
                        height="100%"
                        width="100%"
                        defaultLanguage="java"
                        defaultValue="// some comment"
                        value={code}
                        onChange={handleEditorChange}
                        onMount={handleEditorDidMount}
                        beforeMount={handleEditorWillMount}
                        onValidate={handleEditorValidation}
                        options={{
                            selectOnLineNumbers: true,
                            automaticLayout: true,
                            minimap: {
                                enabled: false
                            },
                            theme: 'vs-dark'
                        }}
                    />
                </div>

            </ResizablePanel>
        </ResizablePanelGroup>
    </>
}
