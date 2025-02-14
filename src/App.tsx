import './App.css'
import { Landing } from './layout/landing'
import CodeFlow from './components/codeflow/CodeFlow'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import About from './layout/about'
import { Node } from 'reactflow'
import { ConnectionType, EdgeMetadata, NodeType, Visibility} from './types/nodeData'
import { LoginForm } from './components/login-form'
import { AuthGuard, PublicOnlyGuard } from './guards/AuthGuard'
import { ROUTES } from './constants/routes'

function App() {
  const initialMainCode = {
    code: `public class Main {
      public static void main(String[] args) {
          // Test your classes here
      }
  }`, 
    result: 'gooed'
  };

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          {/* Public routes */}
          <Route path={ROUTES.HOME} element={<Landing />} />
          <Route path={ROUTES.ABOUT} element={<About />} />
          <Route path={ROUTES.AUTH_CALLBACK} element={<div>Authenticating...</div>} />
          
          {/* Public only routes (logged out users) */}
          <Route
            path={ROUTES.LOGIN}
            element={
              <PublicOnlyGuard>
                <div className="flex min-h-screen items-center justify-center">
                  <LoginForm />
                </div>
              </PublicOnlyGuard>
            }
          />

          {/* Protected routes (logged in users) */}
          <Route
            path={ROUTES.CODE_FLOW}
            element={
              <AuthGuard>
                <div className="bg-background h-screen w-screen">
                  <div className="w-4/5 h-[600px] mx-auto">
                    <CodeFlow 
                      initialNodes={initialNodes}
                      initialEdgesMetadata={initialEdges}
                      initialMainCode={initialMainCode}
                    />
                  </div>
                </div>
              </AuthGuard>
            }
          />

          {/* Catch all redirect to home */}
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </div>
    </Router>
  )
}

// ...rest of the existing initialNodes and initialEdges code...
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
                position: { x: 0, y: 0 }
            },
            // onChange: (node: NodeData) => handleNodeChange(node)
        },
        type: 'umlNode'
    }, {
        id: "2",
        type: "umlNode", // Use the custom node type
        position: { x: 0, y: 300 },
        data: {
            // onChange: (node: NodeData) => handleNodeChange(node),
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



    const initialEdges: EdgeMetadata[] = [{
        id: 'e1-2', source: '2', target: '1',
        sourceHandle: 'source-top-10',
        targetHandle: 'target-bottom-10',
        connectionType: ConnectionType.INHERITANCE,
    }];


export default App