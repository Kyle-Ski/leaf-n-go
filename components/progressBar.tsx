import React from 'react';

interface ProgressBarProps {
    label: string;
    percentage: number;
    color: string;
    description: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, percentage, color, description }) => {
    return (
        <div className="mb-4">
            <p className="text-gray-700">{label}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                    className={`h-2 rounded-full transition-all duration-300 bg-${color}-500`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            <span className="text-xs text-gray-500 mt-2 block">{description}</span>
        </div>
    );
};

export default ProgressBar;
