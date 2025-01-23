export interface NodeData {
    id: string;
    name: string;
    type: NodeType;
    properties: Property[];
    methods: Method[];
    extends?: string[];
    implements?: string[];
    position: { x: number; y: number };
}

export interface Property {
    name: string;
    type: string;
    visibility: Visibility;
    isStatic: boolean;
}

export interface Method {
    name: string;
    returnType: string;
    parameters: Parameter[];
    visibility: Visibility;
    isStatic: boolean;
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