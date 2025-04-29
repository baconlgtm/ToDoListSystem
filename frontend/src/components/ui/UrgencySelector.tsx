import React from 'react';

export interface UrgencySelectorProps {
    value: number;
    onChange: (urgency: number) => void;
    className?: string;
}

export function UrgencySelector({ value, onChange, className = '' }: UrgencySelectorProps) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <button
                type="button"
                onClick={() => onChange(3)}
                className={`w-4 h-4 rounded-full bg-red-600 ${value === 3 ? 'ring-2 ring-offset-2 ring-red-600' : ''}`}
                aria-label="High urgency"
            />
            <button
                type="button"
                onClick={() => onChange(2)}
                className={`w-4 h-4 rounded-full bg-red-300 ${value === 2 ? 'ring-2 ring-offset-2 ring-red-300' : ''}`}
                aria-label="Medium urgency"
            />
            <button
                type="button"
                onClick={() => onChange(1)}
                className={`w-4 h-4 rounded-full bg-blue-400 ${value === 1 ? 'ring-2 ring-offset-2 ring-blue-400' : ''}`}
                aria-label="Low urgency"
            />
            <button
                type="button"
                onClick={() => onChange(0)}
                className={`w-4 h-4 rounded-full bg-green-400 ${value === 0 ? 'ring-2 ring-offset-2 ring-green-400' : ''}`}
                aria-label="No urgency"
            />
        </div>
    );
} 