import { useState, useEffect } from 'react';

const VIEW_MODE_KEY = 'cafeteria_view_mode';

export const useViewMode = () => {
    const [isDesktop, setIsDesktop] = useState(() => {
        return localStorage.getItem(VIEW_MODE_KEY) === 'desktop';
    });

    useEffect(() => {
        if (isDesktop) {
            document.body.classList.add('desktop-forced');
        } else {
            document.body.classList.remove('desktop-forced');
        }
        localStorage.setItem(VIEW_MODE_KEY, isDesktop ? 'desktop' : 'mobile');
    }, [isDesktop]);

    const toggleViewMode = () => setIsDesktop(prev => !prev);

    return { isDesktop, toggleViewMode };
};
