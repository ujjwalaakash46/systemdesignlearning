import { Method, NodeType, Parameter, Property, Visibility } from "@/types/nodeData";
import { Edge, Node } from "reactflow";

interface ParsedClass {
  name: string;
  type: NodeType;
  methods: Method[];
  properties: Property[];
  extends?: string;
  implements?: string[];
}

export const parseJavaCode = (code: string): { nodes: Node[], edges: Edge[] } => {
  // Clean and normalize code
  const cleanCode = code
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .replace(/\/\/.*/g, '')           // Remove single-line comments
    .replace(/\s+/g, ' ')            // Normalize whitespace
    .trim();

  // Find all class and interface declarations
  const classRegex = /(class|interface)\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([\w,\s]+))?\s*{([^}]+)}/g;
  const parsedClasses: ParsedClass[] = [];
  
  let match;
  while ((match = classRegex.exec(cleanCode)) !== null) {
    const [_, type, name, extendsClass, implementsStr, body] = match;
    
    // Parse class body
    const properties: Property[] = [];
    const methods: Method[] = [];
    
    // Split body into declarations
    const declarations = body.split(';')
      .map(d => d.trim())
      .filter(d => d.length > 0);
    
    declarations.forEach(declaration => {
      try {
        if (declaration.includes('(')) {
          const method = parseMethodDeclaration(declaration);
          if (method) methods.push(method);
        } else {
          const property = parsePropertyDeclaration(declaration);
          if (property) properties.push(property);
        }
      } catch (error) {
        console.warn('Failed to parse declaration:', declaration);
      }
    });

    parsedClasses.push({
      name,
      type: type === 'interface' ? NodeType.INTERFACE : NodeType.CLASS,
      methods,
      properties,
      extends: extendsClass || undefined,
      implements: implementsStr ? implementsStr.split(',').map(s => s.trim()) : []
    });
  }

  return convertToNodesAndEdges(parsedClasses);
};

const parseMethodDeclaration = (declaration: string): Method => {
  const methodRegex = /(?:(public|private|protected)\s+)?(?:(static)\s+)?(?:(\w+)\s+)?(\w+)\s*\((.*?)\)/;
  const match = declaration.match(methodRegex);
  
  if (!match) throw new Error('Invalid method declaration');
  
  const [_, visibility, isStatic, returnType, name, params] = match;
  
  return {
    name,
    returnType: returnType || 'void',
    parameters: parseParameters(params),
    visibility: parseVisibility(visibility),
    isStatic: !!isStatic
  };
};

const parsePropertyDeclaration = (declaration: string): Property => {
  const propertyRegex = /(?:(public|private|protected)\s+)?(?:(static)\s+)?(\w+)\s+(\w+)/;
  const match = declaration.match(propertyRegex);
  
  if (!match) throw new Error('Invalid property declaration');
  
  const [_, visibility, isStatic, type, name] = match;
  
  return {
    name,
    type,
    visibility: parseVisibility(visibility),
    isStatic: !!isStatic
  };
};

const parseParameters = (params: string): Parameter[] => {
  if (!params.trim()) return [];
  
  return params.split(',').map(param => {
    const [type, name] = param.trim().split(/\s+/);
    return { type, name };
  });
};

const parseVisibility = (visibility: string | undefined): Visibility => {
  switch (visibility?.toLowerCase()) {
    case 'public': return Visibility.PUBLIC;
    case 'private': return Visibility.PRIVATE;
    case 'protected': return Visibility.PROTECTED;
    default: return Visibility.PUBLIC;
  }
};

const convertToNodesAndEdges = (classes: ParsedClass[]): { nodes: Node[], edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let position = { x: 0, y: 0 };

  classes.forEach((cls, index) => {
    // Create node
    const node: Node = {
      id: cls.name,
      type: 'umlNode',
      position: { x: position.x + (index * 300), y: position.y + (index * 100) },
      data: {
        node: {
          id: cls.name,
          name: cls.name,
          type: cls.type,
          properties: cls.properties,
          methods: cls.methods
        },
        onChange: () => {} // This will be handled by the parent component
      }
    };
    nodes.push(node);

    // Create inheritance edge
    if (cls.extends) {
      edges.push({
        id: `${cls.name}-${cls.extends}-inheritance`,
        source: cls.name,
        target: cls.extends,
        type: 'custom',
        data: { connectionType: 'inheritance' }
      });
    }

    // Create implementation edges
    cls.implements?.forEach(impl => {
      edges.push({
        id: `${cls.name}-${impl}-implementation`,
        source: cls.name,
        target: impl,
        type: 'custom',
        data: { connectionType: 'implementation' }
      });
    });
  });

  return { nodes, edges };
};
