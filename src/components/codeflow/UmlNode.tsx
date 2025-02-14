import { NodeData, visibilitySymbols } from "@/types/nodeData";
import { useEffect, memo } from "react";
import { Handle, Position } from "reactflow";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { MdEdit } from "react-icons/md";
import { cn } from "@/utils/utils";

interface NodeProps {
  data: {
    node: NodeData;
    onChange: (node: NodeData) => void;
    onEdit?: (node: NodeData) => void;
  };
  isConnectable: boolean;
  selected: boolean;
}

const sideHandleCount = 10;
const centerHandleCount = 20;
const tranY = 90;

const UmlNode = memo(({ data, isConnectable, selected }: NodeProps) => {
  // const handleSave = (updatedNode: NodeData) => {
  //   console.log('updatedNode', updatedNode, "data", data);

  //   data.onChange(updatedNode)
  // }

  useEffect(() => {
    console.log('selected', data)
  }, [])

  return (
    <>
      <div className={cn(
        "relative",
        selected ? "ring-2 ring-primary" : "",
        "bg-background border border-border rounded-lg shadow-lg"
      )}>
        {/* Top Handle Bar */}
        <div className="absolute -top-3 left-0 w-full flex-row" style={{ transform: `translateY(${{ tranY }}%)`, display: 'flex' }}>
          <div className="h-3 bg-gray-400 w-3/12 rounded-sm relative">
            {/* Hidden handles for connections */}
            {Array.from({ length: sideHandleCount }).map((_, i) => (
              <Handle
                key={`target-${i}`}
                id={`target-top-${i}`}
                type="target"
                position={Position.Top}
                style={{
                  opacity: 0,
                  position: 'absolute',
                  left: `${(i / sideHandleCount) * 100}%`,
                  transform: `translateY(0%)`,
                  top: 0,
                  width: '8px',
                  height: '8px',
                  background: 'transparent',
                }}
                isConnectable={isConnectable}
              />
            ))}
          </div>
          <div className="h-3 bg-green-400 w-6/12 rounded-sm relative">
            {/* Hidden handles for connections */}
            {Array.from({ length: centerHandleCount }).map((_, i) => (
              <Handle
                key={`source-${i}`}
                id={`source-top-${i}`}
                type="source"
                position={Position.Top}
                style={{
                  opacity: 0,
                  position: 'absolute',
                  left: `${(i / centerHandleCount) * 100}%`,
                  transform: `translateY(0%)`,
                  top: 0,
                  width: '8px',
                  height: '8px',
                  background: 'transparent',
                }}
                isConnectable={isConnectable}
              />
            ))}
          </div>
          <div className="h-3 bg-gray-400 w-3/12 rounded-sm relative">
            {/* Hidden handles for connections */}
            {Array.from({ length: sideHandleCount }).map((_, i) => (
              <Handle
                key={`target-${i + 10}`}
                id={`target-top-${i + 10}`}
                type="target"
                position={Position.Top}
                style={{
                  opacity: 0,
                  position: 'absolute',
                  left: `${(i / sideHandleCount) * 100}%`,
                  transform: `translateY(0%)`,
                  top: 0,
                  width: '8px',
                  height: '8px',
                  background: 'transparent',
                }}
                isConnectable={isConnectable}
              />
            ))}
          </div>
        </div>

        {/* Main Node Content */}
        <div className={cn(
          "border border-border",
          "bg-background",
          "shadow-lg",
          "w-72"
        )}>
          {/* Node Header */}
          <div className="bg-primary text-primary-foreground p-2 font-bold text-center">
            {`${data.node?.type} ${data.node?.name}`}
          </div>

          {/* Properties */}
          <div className="p-2 text-foreground">
            <div className="font-semibold mb-1 flex justify-between">
              <span>Properties:</span>
            </div>
            {data.node.properties.length > 0 ? (
              data.node.properties.map((property, index) => (
                <div key={index} className="text-sm flex justify-start items-center my-1">
                  {`${visibilitySymbols[property.visibility]} ${property.name}: ${property.type}`}
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No properties</div>
            )}
          </div>
          <Separator />

          {/* Methods */}
          <div className="p-2 text-foreground">
            <div className="font-semibold mb-1 flex justify-between">
              <span>Methods:</span>
            </div>
            {data.node.methods.length > 0 ? (
              data.node.methods.map((method, index) => (
                <div key={index} className="text-sm flex justify-between items-center my-1">
                  {`${visibilitySymbols[method.visibility]} ${method.name}(${method.parameters.map(param => `${param.type} ${param.name}`).join(', ')}): ${method.returnType} ${method.isStatic ? '(static)' : ''}`}
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No methods</div>
            )}
          </div>

          <Separator />

          <div className="absolute bottom-0 top-0 right-0">
            {selected && (
              <Button
                onClick={() => data.onEdit!(data.node)}
                className="p-2 w-full rounded-full"
              >
                <MdEdit />
              </Button>
            )}
          </div>
        </div>

        {/* Bottom Handle Bar */}
        <div className="absolute -bottom-1 left-0 w-full" style={{ transform: 'translateY(50%)', display: 'flex' }}>
          <div className="h-3 bg-green-400 w-3/12 rounded-sm relative">
            {/* Hidden handles for connections */}
            {Array.from({ length: sideHandleCount }).map((_, i) => (
              <Handle
                key={`source-${i}`}
                id={`source-bottom-${i}`}
                type="source"
                position={Position.Bottom}
                style={{
                  opacity: 0,
                  position: 'absolute',
                  left: `${(i / sideHandleCount) * 100}%`,
                  transform: 'translateX(-0%)',
                  bottom: 0,
                  width: '8px',
                  height: '8px',
                  background: 'transparent',
                }}
                isConnectable={isConnectable}
              />
            ))}
          </div>
          <div className="h-3 bg-gray-400 w-6/12 rounded-sm relative px-2">
            {/* Hidden handles for connections */}
            {Array.from({ length: centerHandleCount }).map((_, i) => (
              <Handle
                key={`target-${i}`}
                id={`target-bottom-${i}`}
                type="target"
                position={Position.Bottom}
                style={{
                  opacity: 0,
                  position: 'absolute',
                  left: `${(i / centerHandleCount) * 100}%`,
                  transform: 'translateY(-0%)',
                  bottom: 0,
                  width: '8px',
                  height: '8px',
                  background: 'transparent',
                }}
                isConnectable={isConnectable}
              />
            ))}
          </div>
          <div className="h-3 bg-green-400 w-3/12 rounded-sm relative">
            {/* Hidden handles for connections */}
            {Array.from({ length: sideHandleCount }).map((_, i) => (
              <Handle
                key={`source-${i + 10}`}
                id={`source-bottom-${i + 10}`}
                type="source"
                position={Position.Bottom}
                style={{
                  opacity: 0,
                  position: 'absolute',
                  left: `${(i / sideHandleCount) * 100}%`,
                  transform: 'translateX(-0%)',
                  bottom: 0,
                  width: '8px',
                  height: '8px',
                  background: 'transparent',
                }}
                isConnectable={isConnectable}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
})

export default UmlNode