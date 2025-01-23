import { ConnectionType } from "@/types/nodeData";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useState, useEffect, useRef } from "react";

interface ConnectionTypeSelectorProps {
    position: { x: number; y: number };
    onSelect: (type: ConnectionType) => void;
    onCancel: () => void;
}

export function ConnectionTypeSelector({ position, onSelect, onCancel }: ConnectionTypeSelectorProps) {
    const [isOpen, setIsOpen] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const value = target.textContent;
 
            if (!(value && Object.values(ConnectionType).find((type) => type === value))) {            
                setIsOpen(false);
                onCancel();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (type: ConnectionType) => {
        console.log('connection type selected', type);

        setIsOpen(false);
        onSelect(type);
    };

    return (
        <div ref={dropdownRef} style={{ position: 'absolute' }} className="z-50 top-2 left-2 connection-type-selector">
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button>Select Connection Type</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {Object.values(ConnectionType).map((type) => (
                        <DropdownMenuItem key={type} onSelect={() => handleSelect(type as ConnectionType)}>
                            {type}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
