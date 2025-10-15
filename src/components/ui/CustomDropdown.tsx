import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

type Option = {
    value: string | number;
    label: string;
};

type CustomDropdownProps = {
    options: Option[];
    selectedValue: string | number | null;
    onSelect: (value: string | number) => void;
    placeholder?: string;
    disabled?: boolean;
};

export function CustomDropdown({
    options,
    selectedValue,
    onSelect,
    placeholder = 'Seleccionar...',
    disabled = false,
}: CustomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedLabel = options.find(opt => opt.value === selectedValue)?.label || placeholder;

    const handleSelect = (value: string | number) => {
        onSelect(value);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className="w-full flex justify-between items-center bg-principal-500 hover:bg-principal-600 transition-colors px-4 py-3 font-semibold text-white rounded-t-xl"
            >
                <span>{selectedLabel}</span>
                <ChevronDown
                    className={`w-5 h-5 text-blanco transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </button>

            {isOpen && (
                <div
                    className="absolute left-0 top-full z-20 w-full bg-blanco px-6 py-4 border-2 border-principal-500 rounded-b-xl shadow-lg overflow-y-auto transition-all duration-300"
                    style={{ maxHeight: "200px" }}
                >
                    <div className="space-y-1">
                        {options.length === 0 ? (
                            <p className="text-neutro-500 text-sm px-3 py-2">No hay opciones disponibles.</p>
                            ) : (
                            options.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={`w-full text-left px-4 py-2 rounded-md border transition-all duration-150 ${
                                        selectedValue === option.value
                                            ? "bg-principal-100 border-principal-400 text-principal-700 font-semibold"
                                            : "bg-blanco hover:bg-neutro-100 border-neutro-200"
                                    }`}
                                >
                                {option.label}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}