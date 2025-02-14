import { NodeData, Method, Property, Parameter, Visibility, visibilitySymbols } from "@/types/nodeData"
import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { IoIosAddCircleOutline, IoIosCodeDownload } from "react-icons/io"
import { MdDeleteOutline } from "react-icons/md"
import { Separator } from "../ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import ParameterEditor from "./ParameterEditor"
import { cn } from "@/utils/utils"
import { BsArrowUpCircle } from "react-icons/bs";
import { Editor } from "@monaco-editor/react"
import { PiBracketsRound } from "react-icons/pi";
import { HiCodeBracket } from "react-icons/hi2";

interface NodeEditDialogProps {
    node: NodeData
    open: boolean
    onClose: () => void
    onSave: (node: NodeData, closeDialog: boolean) => void
}

const options = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' },
    { value: 'mango', label: 'Mango' },
    { value: 'orange', label: 'Orange' },
];

const state = {
    selectedOption: null,
};


export function NodeEditDialog({ node, open, onClose, onSave }: NodeEditDialogProps) {
    const [editableNode, setEditableNode] = useState<NodeData>(node)
    const [isParamModalOpen, setIsParamModalOpen] = useState(false)
    const [currentMethodIndex, setCurrentMethodIndex] = useState<number | null>(null)
    const [openMethodIndex, setOpenMethodIndex] = useState<number | null>(null);

    const handleInputChange = (
        field: keyof NodeData,
        value: string | Property[] | Method[]
    ) => {
        setEditableNode((prev) => ({
            ...prev,
            [field]: value,
        }))
        handleSave(false);
    }

    const [selectedOptions, setSelectedOptions] = useState([]);
    const handleChange = (selected: any) => {
        setSelectedOptions(selected || []); // Handle clearing selections
    };


    const closeDialog = () => {
        onClose();
        handleParameterClose();
    }

    const onChangePropertyVisibility = (index: number, visibility: Visibility) => {
        const updatedProperties = [...editableNode.properties]
        updatedProperties[index].visibility = visibility
        handleInputChange("properties", updatedProperties)
    }

    const onChangeMethodVisibility = (index: number, visibility: Visibility) => {
        const updatedMethods = [...editableNode.methods]
        updatedMethods[index].visibility = visibility
        handleInputChange("methods", updatedMethods)
    }

    const handleAddParameter = (index: number) => {
        setCurrentMethodIndex(index)
        setIsParamModalOpen(true)
    }

    const handleParameterChange = (parameters: Parameter[]) => {
        if (currentMethodIndex !== null) {
            const updatedMethods = [...editableNode.methods]
            updatedMethods[currentMethodIndex].parameters = parameters
            handleInputChange("methods", updatedMethods)
        }
        // isCloseDialog ?? handleParameterClose()
    }

    const handleParameterClose = () => {
        console.log("closing para");

        setIsParamModalOpen(false);
        setCurrentMethodIndex(null);
    };

    const handleSave = (isCloseDialog: boolean) => {
        const updatedNode = {
            ...editableNode,
            methods: editableNode.methods.filter(method => method.name !== ''),
            properties: editableNode.properties.filter(property => property.name !== '')
        }
        onSave(updatedNode, isCloseDialog);
        if (isCloseDialog) closeDialog()
    }

    const onMethodCodeChange = (name: string, code: any) => {
        const updatedNode = {
            ...node,
            methods: editableNode.methods.map(method => {
                method.name === name ? method.insideCode = code : method
                return method;
            })
        }
        onSave(updatedNode, false);
    }

    const toggleMethodAccordion = (index: number) => {
        console.log("toggleMethodAccordion", index);

        setOpenMethodIndex(prev => (prev === index ? null : index));
    };

    return (
        <div className="absolute inset-0 flex items-center justify-center z-30" style={{ backdropFilter: 'blur(5px)' }}>
            <div className="bg-background border border-border rounded-lg shadow-lg max-w-2xl w-auto min-w-[550px] max-h-[90vh] overflow-y-auto p-4">
                {/* Header */}
                {/* <h2 className="font-bold text-center mb-2">Edit {node.type}: {node.name}</h2> */}
                <div className="space-y-4">
                    <div className={cn(
                        "relative",
                        "bg-background border border-border rounded-lg shadow-lg"
                    )}>

                        <div className={cn(
                            "border border-border",
                            "bg-background",
                            "shadow-lg"
                        )}>
                            {/* Node Header */}
                            <div className="bg-primary text-primary-foreground p-2 font-bold text-center">

                                <Input
                                    type="text"
                                    value={editableNode.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    className="w-full border-none p-1"
                                />

                            </div>

                            {/* Properties */}
                            <div className="p-2 text-foreground">
                                <div className="font-semibold mb-1 flex justify-between">
                                    <span className="text-xs">Properties:</span>

                                    <div className="w-8 h-8 rounded-full shadow-md justify-center items-center flex" >

                                        <IoIosAddCircleOutline scale={2} size={20} style={{ strokeWidth: '10px' }} className="w-8"
                                            onClick={() =>
                                                handleInputChange("properties", [
                                                    ...editableNode.properties,
                                                    { name: "", type: "", visibility: Visibility.PUBLIC, isStatic: false, isFinal: false },
                                                ])
                                            }
                                        />
                                    </div>

                                </div>
                                <div className="grid grid-cols-[1.5rem_2rem_2rem_7rem_7rem_7rem_2rem_2rem] gap-x-2 text-xs text-center items-center text-muted-foreground">
                                    <span>A</span>
                                    <span>S</span>
                                    <span>F</span>
                                    <span>Name</span>
                                    <span>Type</span>
                                    <span>Initial value</span>
                                    <span></span>
                                </div>
                                {editableNode.properties.length > 0 ? (
                                    editableNode.properties.map((property, index) => (
                                        <div key={index} className="grid grid-cols-[1.25rem_2rem_2rem_7rem_7rem_7rem_2rem_2rem] gap-x-2 my-1">

                                            <div className="flex items-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button className="text-center w-5 h-5 p-2 mx-1 rounded-md ">
                                                            {visibilitySymbols[property.visibility]}
                                                        </Button>
                                                        {/* <div className="w-8 h-8 rounded-md shadow-md justify-center items-center flex" >
                                                                
                                                        </div> */}
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        side="bottom"
                                                        align="center"
                                                        sideOffset={4}
                                                    >
                                                        {Object.values(Visibility).map((visibility) =>

                                                        (<DropdownMenuItem key={visibility} onSelect={() => onChangePropertyVisibility(index, visibility)}>
                                                            {visibility}
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
                                                <div className="w-8 h-8 mx-1 rounded-md shadow-md justify-center items-center flex flex-shrink-0" >
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
                                                <div className="w-8 h-8 mx-1 rounded-md shadow-md justify-center items-center flex flex-shrink-0" >
                                                    <input
                                                        type="checkbox"
                                                        checked={property.isFinal}
                                                        onChange={(e) => {
                                                            const updatedProperties = [...editableNode.properties];
                                                            updatedProperties[index].isFinal = e.target.checked;
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
                                                    className="w-28 h-8 mx-1 text-xs"
                                                />
                                                <Input
                                                    type="text"
                                                    value={property.type}
                                                    onChange={(e) => {
                                                        const updatedProperties = [...editableNode.properties];
                                                        updatedProperties[index].type = e.target.value;
                                                        handleInputChange("properties", updatedProperties);
                                                    }}
                                                    className="w-28 h-8 mx-1 text-xs"
                                                />
                                                <Input
                                                    style={{ fontSize: '10px' }}
                                                    type="text"
                                                    value={property.initialValue}
                                                    onChange={(e) => {
                                                        const updatedProperties = [...editableNode.properties];
                                                        updatedProperties[index].initialValue = e.target.value;
                                                        handleInputChange("properties", updatedProperties);
                                                    }}
                                                    className="w-28 h-8 mx-1 text-xm"
                                                />
                                                <div className="w-8 h-8 mx-1 rounded-md shadow-md justify-center items-center flex" onClick={() => {
                                                    const updatedProperties = [...editableNode.properties];
                                                    updatedProperties.splice(index, 1);
                                                    handleInputChange("properties", updatedProperties);
                                                }} >
                                                    <MdDeleteOutline className="text-red-500 w-8" size={16} />
                                                </div>

                                            </div>

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
                                    <span className="text-xs">Methods:</span>

                                    <div className="w-8 h-8 rounded-full shadow-md justify-center items-center flex" >

                                        <IoIosAddCircleOutline scale={2} size={20} style={{ strokeWidth: '10px' }} className="w-8 cursor-pointer"
                                            onClick={() =>
                                                handleInputChange("methods", [
                                                    ...editableNode.methods,
                                                    {
                                                        name: "",
                                                        returnType: "",
                                                        parameters: [],
                                                        visibility: Visibility.PUBLIC,
                                                        isStatic: false,
                                                        isFinal: false,
                                                        insideCode: ""
                                                    },
                                                ])
                                            }
                                        />
                                    </div>

                                </div>
                                <div className="grid grid-cols-[1.5rem_2rem_2rem_7rem_7rem_3rem_3rem_3rem] gap-x-2 text-xs text-center items-center text-muted-foreground">
                                    <span>A</span>
                                    <span>S</span>
                                    <span>F</span>
                                    <span>Name</span>
                                    <span>ReturnType</span>
                                    <span>Param</span>
                                    <span>Code</span>
                                    <span></span>
                                </div>
                                {editableNode.methods.length > 0 ? (
                                    editableNode.methods.map((method, index) => (
                                        <div key={index}>
                                            <div className="grid grid-cols-[1.25rem_2rem_2rem_7rem_7rem_3rem_3rem_3rem] gap-x-2 my-2">
                                                {/* Method Accordion Header */}
                                                <div

                                                    className="flex items-center"
                                                >
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button className="text-center w-5 h-5 p-2 mx-1 rounded-md ">
                                                                {visibilitySymbols[method.visibility]}
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            side="bottom"
                                                            align="center"
                                                            sideOffset={4}
                                                        >
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
                                                    <div className="w-8 h-8 mx-1 rounded-md shadow-md justify-center items-center flex" >
                                                        {/* <div className="text-center p-2 w-9 rounded-md">{method.visibility}</div> */}
                                                        <input
                                                            type="checkbox"
                                                            checked={method.isFinal}
                                                            onChange={(e) => {
                                                                const updatedMethods = [...editableNode.methods];
                                                                updatedMethods[index].isFinal = e.target.checked;
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
                                                        className="w-28 h-8 mx-1"
                                                    />
                                                    <Input
                                                        type="text"
                                                        value={method.returnType}
                                                        onChange={(e) => {
                                                            const updatedMethods = [...editableNode.methods];
                                                            updatedMethods[index].returnType = e.target.value;
                                                            handleInputChange("methods", updatedMethods);
                                                        }}
                                                        className="w-28 h-8 mx-1"
                                                    />
                                                    <Popover open={isParamModalOpen && currentMethodIndex === index} onOpenChange={(open) => !open}>
                                                        <PopoverTrigger asChild>
                                                            <div className="w-12 h-8 mx-1 rounded-md shadow-md justify-center items-center flex">

                                                                <PiBracketsRound className="w-12" onClick={() => handleAddParameter(index)} />
                                                            </div>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-96" style={{ zIndex: 1000, pointerEvents: 'auto' }}>
                                                            <ParameterEditor
                                                                parameters={editableNode.methods[currentMethodIndex!]?.parameters}
                                                                onChange={handleParameterChange}
                                                                onCancel={handleParameterClose}
                                                            />
                                                        </PopoverContent>
                                                    </Popover>

                                                    <div className="w-8 h-8 mx-1 rounded-md shadow-md justify-center items-center flex">
                                                        {(openMethodIndex !== index) ?
                                                            <HiCodeBracket onClick={() => toggleMethodAccordion(index)} scale={1} size={20} style={{ strokeWidth: '0px' }} className="w-12" />
                                                            : <>
                                                                <BsArrowUpCircle onClick={() => toggleMethodAccordion(index)} className="w-12" />
                                                            </>}
                                                    </div>

                                                    <div className="w-8 h-8 mx-1 rounded-md shadow-md justify-center items-center flex" onClick={() => {
                                                        const updatedMethods = [...editableNode.methods];
                                                        updatedMethods.splice(index, 1);
                                                        handleInputChange("methods", updatedMethods);
                                                    }} >
                                                        <MdDeleteOutline className="text-red-500 w-12" size={16} />
                                                    </div>
                                                </div>
                                            </div>
                                            {openMethodIndex === index && (
                                                <div className="p-2 rounded-md">
                                                    <Editor
                                                        height="200px"
                                                        defaultLanguage="java"
                                                        defaultValue={method.insideCode ? method.insideCode : ""}
                                                        onChange={(value) => {
                                                            const updatedMethods = [...editableNode.methods];
                                                            updatedMethods[index].insideCode = value;
                                                            handleInputChange("methods", updatedMethods);
                                                            onMethodCodeChange(method.name, value);
                                                        }}
                                                    >
                                                    </Editor>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-gray-500">No methods</div>
                                )}
                            </div>

                            <Separator />

                            <div className="flex justify-end p-2 gap-2">
                                <Button variant="ghost" onClick={closeDialog}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                    close
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
