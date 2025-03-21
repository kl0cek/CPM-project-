import React from 'react';

interface InputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label?: string;
    className?: string;
    placeholder?: string;
}

const Input: React.FC<InputProps> = ({
    value,
    onChange,
    label,
    className = '',
    placeholder = ''
}) => {
    return (
        <div className="w-full">
            {label && <label className="block mb-2">{label}</label>}
            <input
                type="text"
                value={value}
                onChange={onChange}
                className={`w-full bg-gray-700 p-3 rounded ${className}`}
                placeholder={placeholder}
            />
        </div>
    );
};

export default Input;