import { useState } from "react";
import { Parameter } from "@/types/nodeData";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { MdDeleteOutline } from "react-icons/md";
import { IoIosAddCircleOutline } from "react-icons/io";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

interface ParameterEditorProps {
    parameters: Parameter[];
    onChange: (parameters: Parameter[]) => void;
    onCancel: () => void;
}

const ParameterEditor = ({ parameters, onChange, onCancel }: ParameterEditorProps) => {
    const [editableParameters, setEditableParameters] = useState(parameters);

    const handleParameterChange = (index: number, field: keyof Parameter, value: string) => {
        const updatedParameters = [...editableParameters];
        updatedParameters[index][field] = value;
        setEditableParameters(updatedParameters);
    };

    const handleAddParameter = () => {
        setEditableParameters([...editableParameters, { name: "", type: "" }]);
    };

    const handleDeleteParameter = (index: number) => {
        const updatedParameters = [...editableParameters];
        updatedParameters.splice(index, 1);
        setEditableParameters(updatedParameters);
    };

    const handleSave = () => {
        onChange(editableParameters);
    };

    return (
        <div>
            <div className="font-semibold mb-1 flex justify-between text-sm">
                <span>Parameters:</span>
                <div className="w-8 h-8 rounded-full shadow-md justify-center items-center flex" >
                    <IoIosAddCircleOutline scale={2} size={20} style={{ strokeWidth: '10px' }} className="w-8" onClick={handleAddParameter} />
                </div>
            </div>

            {editableParameters.length !== 0 && <div className="text-xs mb-2 text-gray-600 flex justify-start text-center items-center">
                <span className="w-36 ">Name</span>
                <span className="w-36 ">Type</span>
                <span className="w-8 "></span>
            </div>}

            <ScrollArea className="max-40  rounded-md">
                {editableParameters.length === 0 ?
                    <div className="text-center text-sm m-4">No Parameter</div>
                    :

                    editableParameters.map((parameter, index) => (
                        <div key={index} className="flex justify-between items-center mb-2">
                            <Input
                                type="text"
                                value={parameter.name}
                                onChange={(e) => handleParameterChange(index, "name", e.target.value)}
                                className="w-36 "
                            />
                            <Input
                                type="text"
                                value={parameter.type}
                                onChange={(e) => handleParameterChange(index, "type", e.target.value)}
                                className="w-36 "
                            />
                            <div className="w-8 h-8  rounded-md shadow-md justify-center items-center flex"
                                onClick={() => handleDeleteParameter(index)}>
                                <MdDeleteOutline className="text-red-500 w-8" size={16} />
                            </div>
                        </div>
                    ))}
                    <ScrollBar orientation="vertical" />
            </ScrollArea>
            <div className="flex justify-end my-2"></div>
            <Button onClick={handleSave} className="mr-2 text-green-500">
                Save
            </Button>
            <Button onClick={onCancel} className="mr-2 text-red-500">
                Cancel
            </Button>

        </div>
    );
};

export default ParameterEditor;
