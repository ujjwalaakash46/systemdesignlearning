import { Editor } from "@monaco-editor/react";
import { useCallback, useEffect, useState } from "react";
import ReactFlow, { addEdge, Background, Connection, Controls, Edge, MarkerType, Node, ReactFlowInstance, useEdgesState, useNodesState } from "reactflow"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import 'reactflow/dist/style.css';
import '../../styles/reactflow.css';
import umlNode from "./UmlNode";
import { NodeType, ConnectionType, NodeData, Visibility, Property, Method, EdgeMetadata } from "@/types/nodeData";
import { ConnectionTypeSelector } from "./ConnectionTypeSelector";
import { customAlphabet } from 'nanoid';
import CustomEdge from './CustomEdge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import codeService from '../../services/api/code.service';
import { NodeEditDialog } from "./NodeEditDialog";

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

const generateEdgeId = (edge: Connection, type: ConnectionType) => {

    return [`${edge.source}-${edge.target}-${type}`, `${edge.target}-${edge.source}-${type}`];
}

const toCamelCase = (str: string) => {
    return str[0].toLowerCase() + str.slice(1);
}

const toPascelCase = (str: string) => {
    return str[0].toUpperCase() + str.slice(1);
}

const getEdgeStyle = (type: ConnectionType, isTargetTop: boolean) => {
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
                    markerEnd: isTargetTop ? 'diamondMarkerTop' : 'diamondMarker'
                };
            case ConnectionType.AGGREGATION:
                return {
                    ...commonProps,
                    markerEnd: isTargetTop ? 'diamondMarkerFilledTop' : 'diamondMarkerFilled'
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



interface Props {
    initialNodes: Node[];
    initialEdgesMetadata: EdgeMetadata[];
    initialMainCode: { code: string, result: string };
}

export default function CodeFlow({ initialNodes, initialEdgesMetadata, initialMainCode }: Props) {
    const [code, setCode] = useState<string>("");
    const [mainCode, setMainCode] = useState<string>(initialMainCode.code);
    const [changeTracker, setChangeTracker] = useState<number>(0);

    
    const [pendingConnection, setPendingConnection] = useState<{
        connection: Connection;
        position: { x: number; y: number }
    } | null>(null);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionResult, setExecutionResult] = useState<string>(initialMainCode.result);
    
    const [activeTab, setActiveTab] = useState("main");
    const [editingNode, setEditingNode] = useState<NodeData | null>(null);

    useEffect(() => {
        if (initialNodes?.length) {
            compileUmlToCode();
        }
    }, []);
    
    const convertMetaEdgesToEdges = (initialEdges: EdgeMetadata[]): Edge[] => {
        return initialEdges.map((em: EdgeMetadata) => {
            return {
                ...getEdgeStyle(em.connectionType, em.targetHandle?.startsWith('top')!),
                id: em.id,
                source: em.source,
                target: em.target,
                type: 'custom',
                sourceHandle: em.sourceHandle,
                targetHandle: em.targetHandle,
                
                // animated: true,
                data: { connectionType: em.connectionType },
            }
        })
    }
    
    const handleNodeChange = (newData: NodeData) => {
        setNodes((nds) => {
            const index = nds.findIndex(node => node.id === newData.id);
            if (index === -1) return nds;
            nds[index].data.node = newData;
            return [...nds];
        });
        setChangeTracker(changeTracker + 1);
    };

    const handleEdit = (node: NodeData) => {
        setEditingNode(node);
    }

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes.map((node) => ({
        ...node,
        data: {
            ...node.data,
            onChange: handleNodeChange,
            onEdit: handleEdit, // pass callback for edit
        }
    })));
    
    
    const [edges, setEdges, onEdgesChange] = useEdgesState(convertMetaEdgesToEdges(initialEdgesMetadata));


    const compileUmlToCode = () => {
        let generatedCode = "";
        const updatedNodes = nodes.map(node => {
            let relatedEdges = edges.filter(edge => edge.source === node.id);
            let implementsName = relatedEdges.filter(edge => edge.data.connectionType === ConnectionType.IMPLEMENTATION).map(edge => nodes.find(n => n.id === edge.target)?.data.node.name).join(", ");
            let extendsName = relatedEdges.filter(edge => edge.data.connectionType === ConnectionType.INHERITANCE).map(edge => nodes.find(n => n.id === edge.target)?.data.node.name).join(", ");
            let nodeCode = "";

            nodeCode += `class ${node.data.node.name} ${extendsName ? 'extends ' + extendsName : ''} ${implementsName ? 'implements ' + implementsName : ''} {\n\n`;

            //properties
            node.data.node.properties.forEach((property: Property) => {

                nodeCode += `  ${property.isStatic ? 'static ' : ''}${property.isFinal ? 'final ' : ''}${property.visibility} ${property.type} ${property.name}${property.initialValue?' = '+property.initialValue:''};\n`;
            });
            nodeCode += "\n";

            //methods
            node.data.node.methods.forEach((method: Method) => {

                //method signature
                const isConstructor = node.data.node.name === method.name;
                if (isConstructor) {
                    nodeCode += `  ${method.visibility} ${node.data.node.name}(`;
                } else {
                    nodeCode += `  ${method.isStatic ? 'static ' : ''}${method.isFinal ? 'final ' : ''}${method.visibility} ${method.returnType} ${method.name}(`;
                }

                //method parameters
                nodeCode += method.parameters.map(parameter => `${parameter.type} ${parameter.name}`).join(", ") + " ){\n";
                
                //if contructor, assign parameters to properties

                if(method.insideCode){
                    nodeCode += method.insideCode;
                }else{
                    isConstructor ? nodeCode += method.parameters.map(parameter => `this.${parameter.name} = ${parameter.name}`).join(";\n") : null;
                }



                //end of method
                nodeCode += '\n  }\n\n';
            });

            nodeCode += '}\n\n';

            generatedCode += nodeCode;

            return {
                ...node,
                data: {
                    ...node.data,
                    node: {
                        ...node.data.node,
                        code: nodeCode
                    }
                }
            };
        });
        setNodes(updatedNodes);
        setCode(generatedCode);

        // const allCode = `${generatedCode}\n\n${mainCode}`;
        setCode(generatedCode);
    }

    const compileCodeToUml = useCallback(() => {
        // try {
        //     const { nodes: newNodes, edges: newEdges } = parseJavaCode(code);
        //     setNodes(newNodes);
        //     setEdges(newEdges);
        // } catch (error) {
        //     console.error('Failed to parse Java code:', error);
        //     // Optionally show an error message to the user
        // }
    }, [code]);

    const onConnect = useCallback(
        (params: Connection) => {

            console.log('onConnect', params);

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
            connection.source !== connection.target
            // && // No self connections
            // (!connection.sourceHandle?.startsWith('top') && !connection.targetHandle?.startsWith('bottom')) // Enforce direction
        );
    }, []);

    function isValidEdgeForEnum(sourceType: NodeType, targetType: NodeType, edgeType: ConnectionType): boolean {
        switch (edgeType) {
            case ConnectionType.INHERITANCE:
                // Enums cannot inherit from any other type.
                return !(sourceType === NodeType.ENUM || targetType === NodeType.ENUM);
            case ConnectionType.IMPLEMENTATION:
                // Enums can implement interfaces.
                return sourceType === NodeType.ENUM && targetType === NodeType.INTERFACE;
            case ConnectionType.COMPOSITION:
            case ConnectionType.AGGREGATION:
                // Enums cannot be part of a composition or aggregation.
                return !(sourceType === NodeType.ENUM || targetType === NodeType.ENUM);
            case ConnectionType.DEPENDENCY:
                // Dependency is allowed for enums as source or target.
                return true;
            default:
                return false;
        }
    }

    const handleConnectionTypeSelect = (type: ConnectionType) => {
        if (!pendingConnection) {
            return;
        }

        const [newEdgeId, newEdgeReverseredId] = generateEdgeId(pendingConnection.connection, type);
        const source = pendingConnection.connection.source;
        const sourceNode = nodes.find(n => n.id === source)?.data.node as NodeData;
        const target = pendingConnection.connection.target;
        const targetNode = nodes.find(n => n.id === target)?.data.node as NodeData;

        console.log('new edge id', newEdgeId);

        if (sourceNode.type === NodeType.ENUM || targetNode.type === NodeType.ENUM) {
            //interface
            if (!isValidEdgeForEnum(sourceNode.type, targetNode.type, type)) {
                //error message
                setPendingConnection(null);
                return;

            }
        }

        else if (edges.find(edge => edge.id === newEdgeId || edge.id === newEdgeReverseredId)) {
            //error message
            //make sure the connection is not already present
            setPendingConnection(null);
            return;
        } else if (type === ConnectionType.INHERITANCE) {
            //make sure there is only one inheritance

            if (targetNode.type !== NodeType.INTERFACE || (sourceNode.type === NodeType.INTERFACE && targetNode.type === NodeType.INTERFACE)) {
                //error message
            } else {
                setPendingConnection(null);
                return;
            }




        } else if (type === ConnectionType.IMPLEMENTATION) {
            if (!(targetNode.type === NodeType.CLASS && sourceNode.type === NodeType.INTERFACE)) {
                //error message
                setPendingConnection(null);
                return;
            }
        } else if (type === ConnectionType.COMPOSITION) {

            const isAggergationPresent = edges.find(edge => edge.source === source && edge.target === target && edge.data.connectionType === ConnectionType.AGGREGATION);
            if (!(targetNode.type === NodeType.CLASS && sourceNode.type === NodeType.CLASS) || isAggergationPresent) {
                //error message
                setPendingConnection(null);
                return;
            }

            //update the source node
            const prop: Property = { name: targetNode.name, type: targetNode.name, visibility: Visibility.PRIVATE, isStatic: false , isFinal:false};
            sourceNode.properties.push(prop);

            let constructor = sourceNode.methods.find((method: Method) => method.name === sourceNode.name);
            if (!constructor) {
                constructor = {
                    isStatic: false, isFinal:false, name: sourceNode.name, returnType: '', parameters: [
                        { name: toCamelCase(targetNode.name), type: toPascelCase(targetNode.name) }
                    ], visibility: Visibility.PUBLIC
                };
                sourceNode.methods.push(constructor);
            } else {
                sourceNode.methods = sourceNode.methods.map((method: Method) => {
                    if (method.name === sourceNode.name) {
                        method.parameters.push({ name: targetNode.name, type: targetNode.name });
                    }
                    return method;
                }
                )
            }



        } else if (type === ConnectionType.AGGREGATION) {

            const isCompositionPresent = edges.find(edge => edge.source === source && edge.target === target && edge.data.connectionType === ConnectionType.COMPOSITION);
            if (!(targetNode.type === NodeType.CLASS && sourceNode.type === NodeType.CLASS) || isCompositionPresent) {
                //error message
                setPendingConnection(null);
                return;
            }

            const prop: Property = { name: targetNode.name, type: targetNode.name, visibility: Visibility.PRIVATE, isStatic: false , isFinal:false};
            sourceNode.properties.push(prop);
        } else if (type === ConnectionType.DEPENDENCY) {
            if (!(targetNode.type === NodeType.CLASS && sourceNode.type === NodeType.CLASS)) {
                //error message
                setPendingConnection(null);
                return;
            }
        }

        //conditions

        const isTargetHandlerOnTop = pendingConnection.connection.targetHandle?.includes('top')!;

        const edgeStyle = getEdgeStyle(type, isTargetHandlerOnTop);
        const newEdge: Edge = {
            ...pendingConnection.connection,
            source: pendingConnection.connection.source!,
            target: pendingConnection.connection.target!,
            id: newEdgeId,
            data: { connectionType: type },
            ...edgeStyle,
        };
        setEdges((eds) => addEdge(newEdge, eds));
        setPendingConnection(null);

    };

    const handleConnectionCancel = useCallback(() => {
        setPendingConnection(null);
    }, []);



    const executeCode = async () => {
        setIsExecuting(true);
        try {
            // Format the code by removing extra newlines and spaces
            const formattedCode = code.replace(/\n\s*\n/g, '\n').trim();
            const formattedMainCode = mainCode.replace(/\n\s*\n/g, '\n').trim();

            // Combine code in proper order for compilation
            // const fullCode = `${formattedCode}\n\n${formattedMainCode}`;

            const response: any = await codeService.executeCode({
                code: formattedCode,
                main: formattedMainCode // We don't need to send main separately since it's combined
            });

            if (response.error || response.stderr || response.compile_output) {
                setExecutionResult(`Error: ${response.error || response.compile_output || response.stderr}`);
            } else {
                setExecutionResult(response.stdout);
            }
            setActiveTab('result');
        } catch (error) {
            setExecutionResult(`Error executing code: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setActiveTab('result');
        } finally {
            setIsExecuting(false);
        }
    };

    const onEdgesDelete = useCallback((edgesToDelete: Edge[]) => {
        console.log('edges to delete', edgesToDelete);

        edgesToDelete.forEach(edge => {
            const sourceNode: NodeData = nodes.find(n => n.id === edge.source)?.data.node;
            const targetNode: NodeData = nodes.find(n => n.id === edge.target)?.data.node;
            if (!targetNode || !sourceNode) {
                return;
            }

            if (edge.data.connectionType === ConnectionType.COMPOSITION) {
                // Update properties and methods
                const updatedSourceNode = {
                    ...sourceNode,
                    properties: sourceNode.properties.filter((prop: Property) => prop.type !== targetNode.name),
                    methods: sourceNode.methods.map((method: Method) => ({
                        ...method,
                        parameters: method.parameters.filter(param => param.type !== targetNode.name)
                    })).filter(method => method.name !== sourceNode.name || method.parameters.length > 0)
                };
                updateNodeByNodeData(updatedSourceNode);
            } else if (edge.data.connectionType === ConnectionType.AGGREGATION) {
                const updatedSourceNode = {
                    ...sourceNode,
                    properties: sourceNode.properties.filter((prop: Property) => prop.type !== targetNode.name)
                };
                updateNodeByNodeData(updatedSourceNode);
            }
        });

        setEdges((eds) => eds.filter((e) => !edgesToDelete.includes(e)));
    }, [nodes]);

    const updateNodeByNodeData = (nodeData: NodeData) => {
        setNodes((nds) => nds.map(node =>
            (node.id === nodeData.id) ?
                {
                    ...node,
                    data: {
                        ...node.data,
                        node: nodeData
                    }
                } : node
        )
        );
        // Force update by incrementing change tracker
        setChangeTracker(prev => prev + 1);
    };

    useEffect(() => {   // Update code when nodes change
        compileUmlToCode();
        setActiveTab("code");

    }, [changeTracker, nodes.length, edges.length]);


    const addNode = (type: NodeType) => {
        const id = generateId();
        const newNode = {
            id: id,
            position: { x: 100 + nodes.length * 20, y: 100 + nodes.length * 20 }, type: 'umlNode',
            data: {
                onChange: (node: NodeData) => handleNodeChange(node),
                onEdit: handleEdit,
                node: {
                    id: id,
                    name: 'MyClass' + (nodes.length + 1),
                    type: type,
                    properties: [{
                        isStatic: false,
                        name: 'id',
                        type: 'String',
                        visibility: Visibility.PRIVATE
                    }],
                    methods: [{
                        isStatic: false,
                        name: 'getId',
                        returnType: 'String',
                        parameters: [],
                        visibility: Visibility.PUBLIC
                    }],
                    position: { x: 100, y: 100 }
                }
            }
        };
        setNodes((nds) => {
            const updatedNodes = [...nds, newNode];
            return updatedNodes;
        });
    };

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
                onEdit: handleEdit,
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

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);


    const handleCodeEditorChange = useCallback((value: string | undefined) => {
        if (value !== undefined) {
            // setCode(value);
        }
    }, []);

    const handleMainEditorChange = useCallback((value: string | undefined) => {
        if (value !== undefined) {
            setMainCode(value);
        }
    }, []);

    const handleSaveEdit = (updatedNode: NodeData, closeDialog: boolean) => {
        // Update the node in state based on id
        setNodes((nds) => nds.map(node =>
            node.id === updatedNode.id
                ? { ...node, data: { ...node.data, node: updatedNode } }
                : node
        ));
        if(closeDialog) setEditingNode(null);
        setChangeTracker(changeTracker + 1);
    };

    return (
        <ResizablePanelGroup
            direction="horizontal"
            className="rounded-lg border border-border w-full h-full"
        >
            <ResizablePanel defaultSize={50}>
                <div className="w-full h-full flex-grow items-center justify-center p-2 bg-background relative">
                    <div className="react-flow-wrapper ">
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
                        <svg width="0" height="0">
                            <defs>
                                <marker
                                    id="diamondMarkerFilledTop"
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
                                    id="diamondMarkerTop"
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


                        <svg width="0" height="0">
                            <defs>
                                <marker
                                    id="diamondMarkerFilled"
                                    viewBox="0 0 40 40"
                                    markerHeight={30}
                                    markerWidth={30}
                                    refX={5}
                                    refY={0}
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
                                    refY={0}
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
                            onInit={(instance: ReactFlowInstance) => { instance.zoomTo(0.8) }}
                            proOptions={proOptions}
                            className="bg-background/95 [&_.react-flow__node]:bg-background [&_.react-flow__handle]:bg-primary"
                            nodes={nodes}
                            edges={edges}
                            nodeTypes={nodeTypes}
                            edgeTypes={edgeTypes}
                            // onConnectStart={onConnectStart}
                            // onconnec
                            // onConnectStop={onConnectStop}
                            // onConnectEnd={onConnectStop}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            isValidConnection={isValidConnection}
                            onEdgesDelete={onEdgesDelete}
                            snapToGrid={true}
                            connectionRadius={100}
                            connectOnClick={false}
                            defaultEdgeOptions={{
                                type: 'custom', // Set custom as default edge type
                                style: { stroke: 'hsl(var(--foreground))' },
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

                        {editingNode && (
                          <NodeEditDialog
                              node={editingNode}
                              open={true}
                              onClose={() => setEditingNode(null)}
                              onSave={handleSaveEdit}
                          />
                        )}
                    </div>
                </div>
            </ResizablePanel>
            <ResizableHandle withHandle className="bg-border" />

            {/* Right Panel - Editor Section */}
            <ResizablePanel defaultSize={50}>
                <div className="relative flex flex-col h-full bg-background">
                    {/* Buttons */}
                    {/* <div className="absolute flex justify-end gap-2 p-2">

                    </div> */}

                    {/* Editors */}
                    <div className="flex-1 min-h-0"> {/* This div ensures proper height calculation */}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col p-2">
                            <TabsList className="bg-muted">
                                <TabsTrigger value="code">Code</TabsTrigger>
                                <TabsTrigger value="main">Main</TabsTrigger>
                                <TabsTrigger value="result">Result</TabsTrigger>

                                <Button className="ml-auto"
                                    onClick={executeCode}
                                    disabled={isExecuting}
                                >
                                    {isExecuting ? 'Executing...' : 'Execute'}
                                </Button>
                                <Button onClick={compileCodeToUml}>
                                    Convert to UML
                                </Button>
                            </TabsList>

                            <div className="flex-1 min-h-0 relative"> {/* Another container for proper sizing */}
                                <TabsContent value="code" className="h-full m-0 pt-1">
                                    <Editor

                                        height="100%"
                                        defaultLanguage="java"
                                        value={code}
                                        onChange={handleCodeEditorChange}
                                        options={{
                                            minimap: { enabled: false },
                                            theme: 'vs-dark',
                                            scrollBeyondLastLine: false,
                                            automaticLayout: true,
                                            readOnly: true,
                                        }}
                                        
                                        // onMouseDown={() => setShowOverlay(true)}
                                    />
                                   

                                </TabsContent>

                                <TabsContent value="main" className="h-full m-0 pt-1">
                                    <Editor
                                        height="100%"
                                        defaultLanguage="java"
                                        value={mainCode}
                                        onChange={handleMainEditorChange}
                                        options={{
                                            minimap: { enabled: false },
                                            theme: 'vs-dark',
                                            scrollBeyondLastLine: false,
                                            automaticLayout: true
                                        }}
                                    />
                                </TabsContent>

                                <TabsContent value="result" className="h-full m-0 p-2">
                                    <div className="h-full bg-muted rounded border border-border p-4">
                                        <div className="font-bold text-foreground mb-2">Output:</div>
                                        <pre className="text-muted-foreground font-mono text-sm warp-words w-full">
                                            {executionResult || 'No output yet'}
                                        </pre>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
