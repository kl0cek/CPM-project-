import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    className?: string;
    fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    variant = 'primary',
    className = '',
    fullWidth = false
}) => {
    const baseStyles = "py-2 px-4 rounded";
    const variantStyles = {
        primary: "bg-gray-600 text-white",
        secondary: "bg-gray-700 text-white",
        danger: "bg-red-600 text-white",
        success: "bg-green-600 text-white"
    };

    const widthStyles = fullWidth ? "w-full" : "";


    return (
        <button onClick={onClick}
                className={`${baseStyles} ${variantStyles[variant]} ${widthStyles} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;