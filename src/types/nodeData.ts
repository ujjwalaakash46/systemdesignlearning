export interface NodeData {
    id: string;
    name: string;
    type: NodeType;
    properties: Property[];
    methods: Method[];
    extends?: string[];
    implements?: string[];
    position: { x: number; y: number };
    code?: string;
}

export interface Property {
    name: string;
    type: string;
    visibility: Visibility;
    isStatic: boolean;
    isFinal: boolean;
    initialValue?: string;
}

export interface Method {
    name: string;
    returnType: string;
    parameters: Parameter[];
    visibility: Visibility;
    isStatic: boolean;
    isFinal: boolean;
    insideCode?: string;
}

export interface Parameter {
    name: string;
    type: string;
}

export enum Visibility {
    PUBLIC= "public",
    PRIVATE= "private",
    PROTECTED= "protected"
}

export const visibilitySymbols: Record<Visibility, string> = {
    [Visibility.PUBLIC]: "+",
    [Visibility.PRIVATE]: "-",
    [Visibility.PROTECTED]: "#"
};

export enum NodeType {
    CLASS = "CLASS",
    INTERFACE = "INTERFACE",
    ENUM = "ENUM"
}

export enum ConnectionType {
    INHERITANCE = "Inheritance",
    IMPLEMENTATION = "Implementation",
    COMPOSITION = "Composition",
    AGGREGATION = "Aggregation",
    DEPENDENCY = "Dependency"
}

export interface EdgeMetadata {
            id: string; 
            source: string;
            target: string;
            sourceHandle: string,
            targetHandle: string;
            style?: any ;
            markerEndType?: string;
            markerEndStyle?: any,
            markerStartType?: string;
            markerStartStyle?: any,
            connectionType: ConnectionType.INHERITANCE,
            animated?:boolean,
            isTargetTop?:boolean,
}