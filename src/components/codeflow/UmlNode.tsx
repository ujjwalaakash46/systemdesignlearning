import { Method, NodeData, Parameter, Property, Visibility, visibilitySymbols } from "@/types/nodeData";
import { useCallback, useState } from "react";
import { Connection, Handle, Position } from "reactflow";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { MdDeleteOutline, MdEdit } from "react-icons/md";
import { IoIosAddCircleOutline, IoMdCodeWorking } from "react-icons/io";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import ParameterEditor from "./ParameterEditor";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface NodeProps {
  data: {
    node: NodeData;
    onChange: (node: NodeData) => void;
  };
  isConnectable: boolean;
}

const sideHandleCount = 10;
const centerHandleCount = 20;
const tranY=90;

const UmlNode = ({ data, isConnectable, selected }: NodeProps & { selected: boolean }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableNode, setEditableNode] = useState(data.node);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMethodIndex, setCurrentMethodIndex] = useState<number | null>(null);

  const handleInputChange = (
    field: keyof NodeData,
    value: string | Property[] | Method[]
  ) => {
    setEditableNode((prevNode) => ({
      ...prevNode,
      [field]: value,
    }));
  };

  useCallback(() => {
    setEditableNode(data.node);
  }, [data.node]);

  const handleSave = () => {
    setIsEditMode(false);
    data.onChange(editableNode); // Update the parent state
  };

  const handleCancel = () => {
    setEditableNode(data.node); // Revert to original data
    setIsEditMode(false);
  };

  const onChangePropertyVisibility = (index: number, visibility: Visibility) => {
    const updatedProperties = [...editableNode.properties];
    updatedProperties[index].visibility = visibility;
    handleInputChange("properties", updatedProperties);
  };

  const onChangeMethodVisibility = (index: number, visibility: Visibility) => {
    const updatedMethods = [...editableNode.methods];
    updatedMethods[index].visibility = visibility;
    handleInputChange("methods", updatedMethods);
  };

  const handleAddParameter = (index: number) => {
    setCurrentMethodIndex(index);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentMethodIndex(null);
  };

  const handleParameterChange = (parameters: Parameter[]) => {
    if (currentMethodIndex !== null) {
      const updatedMethods = [...editableNode.methods];
      updatedMethods[currentMethodIndex].parameters = parameters;
      handleInputChange("methods", updatedMethods);
    }
    handleModalClose();
  };

  return (
    <div style={{ backgroundColor: "white", position: "relative" }} className={`shadow-sm ${selected ? 'react-flow__node-selected' : ''}`}>
      {/* Top Handle Bar */}
      <div className="absolute -top-3 left-0 w-full flex-row" style={{ transform: `translateY(${{tranY}}%)`, display:'flex'}}>
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
              key={`target-${i+10}`}
              id={`target-top-${i+10}`}
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
      <div className={`border bg-white shadow-lg ${isEditMode ? 'w-108' : 'w-72'}`}>
        {/* Node Header */}
        <div className="bg-gray-800 text-white text-center p-2 font-bold">
          {isEditMode ? (
            <Input
              type="text"
              value={editableNode.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full border-none p-1"
            />
          ) : (
            `${editableNode?.type} ${editableNode?.name}`
          )}
        </div>

        {/* Properties */}
        <div className="p-2">
          <div className="font-semibold mb-1 flex justify-between">
            <span>Properties:</span>
            {isEditMode && (
              <div className="w-8 h-8 rounded-full shadow-md justify-center items-center flex" >

                <IoIosAddCircleOutline scale={2} size={20} style={{ strokeWidth: '10px' }} className="w-8"
                  onClick={() =>
                    handleInputChange("properties", [
                      ...editableNode.properties,
                      { name: "", type: "", visibility: Visibility.PUBLIC, isStatic: false },
                    ])
                  }
                />
              </div>
            )}
          </div>
          {isEditMode && <div className="text-xs flex justify-start text-center items-center text-gray-600">
            <span className="w-8 mx-1"></span>
            <span className="w-8 mx-1">Static</span>
            <span className="w-36 mx-1">Name</span>
            <span className="w-36 mx-1">Type</span>
            <span className="w-8 mx-1"></span>
          </div>}
          {editableNode.properties.length > 0 ? (
            editableNode.properties.map((property, index) => (
              <div key={index} className="text-sm flex justify-start items-center my-1">
                {isEditMode ? (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="w-8 h-8 mx-1 rounded-md shadow-md justify-center items-center flex" >
                          <div className="text-center p-2 w-9 rounded-md">{
                          visibilitySymbols[property.visibility]}</div>
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        side="bottom"
                        align="center"
                        sideOffset={4}
                      >
                        {Object.values(Visibility).map((visibility) => 
                          
                          (<DropdownMenuItem key={visibility} onSelect={() => onChangePropertyVisibility(index, visibility)}>
                          { visibility}
                          </DropdownMenuItem>))}
                        {/* <DropdownMenuItem onSelect={() => onChangeVisibility(index, Visibility.PRIVATE)}>
                          Private
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onChangeVisibility(index, Visibility.PUBLIC)}>
                          Public
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onChangeVisibility(index, Visibility.PROTECTED)}>
                          Protected
                        </DropdownMenuItem> */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="w-8 h-8 mx-1 rounded-md shadow-md justify-center items-center flex" >
                      <input
                        type="checkbox"
                        checked={property.isStatic}
                        onChange={(e) => {
                          const updatedProperties = [...editableNode.properties];
                          updatedProperties[index].isStatic = e.target.checked;
                          handleInputChange("properties", updatedProperties);
                        }}
                        className=""
                      />
                    </div>
                    <Input
                      type="text"
                      value={property.name}
                      onChange={(e) => {
                        const updatedProperties = [...editableNode.properties];
                        updatedProperties[index].name = e.target.value;
                        handleInputChange("properties", updatedProperties);
                      }}
                      className="w-36 h-8 mx-1"
                    />
                    <Input
                      type="text"
                      value={property.type}
                      onChange={(e) => {
                        const updatedProperties = [...editableNode.properties];
                        updatedProperties[index].type = e.target.value;
                        handleInputChange("properties", updatedProperties);
                      }}
                      className="w-36 h-8 mx-1"
                    />
                    <div className="w-8 h-8 mx-1 rounded-md shadow-md justify-center items-center flex" onClick={() => {
                      const updatedProperties = [...editableNode.properties];
                      updatedProperties.splice(index, 1);
                      handleInputChange("properties", updatedProperties);
                    }} >
                      <MdDeleteOutline className="text-red-500 w-8" size={16} />
                    </div>

                  </>
                ) : (
                  `${visibilitySymbols[property.visibility]} ${property.name}: ${property.type} ${property.isStatic ? '(static)' : ''}`
                )}
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">No properties</div>
          )}
        </div>
        <Separator />

        {/* Methods */}
        <div className="p-2">
          <div className="font-semibold mb-1 flex justify-between">
            <span>Methods:</span>
            {isEditMode && (
              <div className="w-8 h-8 rounded-full shadow-md justify-center items-center flex" >

                <IoIosAddCircleOutline scale={2} size={20} style={{ strokeWidth: '10px' }} className="w-8"
                  onClick={() =>
                    handleInputChange("methods", [
                      ...editableNode.methods,
                      {
                        name: "",
                        returnType: "",
                        parameters: [],
                        visibility: Visibility.PUBLIC,
                        isStatic: false,
                      },
                    ])
                  }
                />
              </div>
            )}
          </div>
          {isEditMode && <div className="text-xs flex justify-between text-center items-center text-gray-600">
            <span className="w-8"></span>
            <span className="w-8 text-center">Static</span>
            <span className="w-36 text-center">Name</span>
            <span className="w-36 ">ReturnType</span>
            <span className="w-8">Param</span>
            <span className="w-8"></span>
          </div>}
          {editableNode.methods.length > 0 ? (
            editableNode.methods.map((method, index) => (
              <div key={index} className="text-sm flex justify-between items-center my-1">
                {isEditMode ? (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="w-8 h-8 mx-1 rounded-md shadow-md justify-center items-center flex" >
                          <div className="text-center p-2 w-9 rounded-md">{ visibilitySymbols[method.visibility]}</div>
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        side="bottom"
                        align="center"
                        sideOffset={4}
                      >

                        {/* {Object.values(Visibility).map((visibility) => (<DropdownMenuItem onSelect={() => onChangeVisibility(index, Visibility.PRIVATE)}>
                          Private
                        </DropdownMenuItem>))} */}
                        {Object.values(Visibility).map((visibility) => 
                          
                          (<DropdownMenuItem key={visibility} onSelect={() => onChangeMethodVisibility(index, visibility)}>
                          {visibility}
                          </DropdownMenuItem>))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="w-8 h-8 mx-1 rounded-md shadow-md justify-center items-center flex" >
                      {/* <div className="text-center p-2 w-9 rounded-md">{method.visibility}</div> */}
                      <input
                        type="checkbox"
                        checked={method.isStatic}
                        onChange={(e) => {
                          const updatedMethods = [...editableNode.methods];
                          updatedMethods[index].isStatic = e.target.checked;
                          handleInputChange("methods", updatedMethods);
                        }}
                        className="w-8"
                      />
                    </div>
                    <Input
                      type="text"
                      value={method.name}
                      onChange={(e) => {
                        const updatedMethods = [...editableNode.methods];
                        updatedMethods[index].name = e.target.value;
                        handleInputChange("methods", updatedMethods);
                      }}
                      className="w-36 h-8 mx-1"
                    />
                    <Input
                      type="text"
                      value={method.returnType}
                      onChange={(e) => {
                        const updatedMethods = [...editableNode.methods];
                        updatedMethods[index].returnType = e.target.value;
                        handleInputChange("methods", updatedMethods);
                      }}
                      className="w-36 h-8 mx-1"
                    />
                    <Popover open={isModalOpen && currentMethodIndex === index}>
                      <PopoverTrigger asChild>
                        <div className="w-8 h-8 mx-1 rounded-md shadow-md justify-center items-center flex">

                          <IoMdCodeWorking onClick={() => handleAddParameter(index)} />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-96">
                        <ParameterEditor
                          parameters={editableNode.methods[currentMethodIndex!]?.parameters}
                          onChange={handleParameterChange}
                          onCancel={handleModalClose}
                        />
                        {/* </div> */}
                      </PopoverContent>
                    </Popover>
                    <div className="w-8 h-8 mx-1 rounded-md shadow-md justify-center items-center flex" onClick={() => {
                      const updatedMethods = [...editableNode.methods];
                      updatedMethods.splice(index, 1);
                      handleInputChange("methods", updatedMethods);
                    }} >
                      <MdDeleteOutline className="text-red-500 w-8" size={16} />
                    </div>
                  </>
                ) : (
                  `${visibilitySymbols[method.visibility]} ${method.name}(${method.parameters.map(param => `${param.type} ${param.name}`).join(', ')}): ${method.returnType} ${method.isStatic ? '(static)' : ''}`
                )}
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">No methods</div>
          )}
        </div>

        <Separator />

        {/* Display generated code if it exists */}
        {/* {editableNode.code && (
          <div className="p-2">
            <div className="font-semibold mb-1">Generated Code:</div>
            <pre className="text-xs bg-gray-100 p-2 rounded">{editableNode.code}</pre>
          </div>
        )} */}

        {isEditMode &&
          <div className="flex justify-end p-2">
            <button onClick={handleSave} className="mr-2 text-green-500">
              Save
            </button>
            <button onClick={handleCancel} className="text-red-500">
              Cancel
            </button>
          </div>}

        <div className="absolute bottom-0 top-0 right-0">
          {!isEditMode && selected && (
            <Button
              onClick={() => setIsEditMode(true)}
              className=" p-2 w-full rounded-full"
            >
              <MdEdit />
            </Button>
          )}
        </div>
      </div>

      {/* Bottom Handle Bar */}


        <div className="absolute -bottom-1 left-0 w-full" style={{ transform: 'translateY(50%)', display:'flex'}}>
        <div className="h-3 bg-green-400 w-3/12 rounded-sm relative">
          {/* Hidden handles for connections */}
          {Array.from({ length: sideHandleCount }).map((_, i) => (
            <Handle
              key={`source-${i+50}`}
              id={`source-bottom-${i+50}`}
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
              key={`target-${i+50}`}
              id={`target-bottom-${i+50}`}
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
              key={`source-${i+160}`}
              id={`source-bottom-${i+160}`}
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
  );
};

export default UmlNode;