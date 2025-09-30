import React from 'react';

export const restringirCaracteres = (event: React.KeyboardEvent<HTMLInputElement>, pattern: RegExp) => {
    if (
        event.key === 'Backspace' ||
        event.key === 'Delete' ||
        event.key === 'Tab' ||
        event.key === 'Enter' ||
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowRight' ||
        event.metaKey
    ) {
        return;
    }

    if (!pattern.test(event.key)) {
        event.preventDefault();
    }
};