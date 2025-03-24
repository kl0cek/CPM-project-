import React from 'react';

interface NumberInputProps {
    value: number;
    onChange: (value: number) => void;
    label?: string;
    min?: number;
    max?: number;
    className?: string;
    showIncrement?: boolean;
}

const NumberInput: React.FC<NumberInputProps> = ({
    value,
    onChange,
    label,
    min = 0,
    max,
    className = '',
    showIncrement = true
}) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(e.target.value) || 0;
        if ((min === undefined || newValue >= min) && (max === undefined || newValue <= max)) {
            onChange(newValue);
        }
    };

    const increment = () => {
        if (max === undefined || value < max) {
            onChange(value + 1);
        }
    };

    return (
        <div className="w-full">
            {label && <label className="block mb-2">{label}</label>}
            <div className="relative">
                <input
                    type="number"
                    value={value}
                    onChange={handleInputChange}
                    className={`w-full bg-gray-700 p-3 rounded ${className}`}
                    min={min}
                    max={max}
                />
                {showIncrement && (
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-2xl"
                        onClick={increment}
                    >
                        +
                    </button>
                )}
            </div>
        </div>
    );
};

export default NumberInput;