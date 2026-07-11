import { useState } from 'react';

/**
 * Hook para manejar notificaciones Toast y modal de confirmación
 * Reemplaza alert() y window.confirm() con UI más agradable
 */
export const useNotification = () => {
    // Toast state
    const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });

    // Confirm modal state
    const [confirm, setConfirm] = useState({ show: false, message: '', onConfirm: null, confirmText: 'Sí, eliminar', confirmVariant: 'danger' });

    const showSuccess = (message) => {
        setToast({ show: true, message, variant: 'success' });
    };

    const showError = (message) => {
        setToast({ show: true, message, variant: 'danger' });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, show: false }));
    };

    const showConfirm = (message, options = {}) => {
        const { confirmText = 'Sí, eliminar', confirmVariant = 'danger' } = options;
        return new Promise((resolve) => {
            setConfirm({
                show: true,
                message,
                confirmText,
                confirmVariant,
                onConfirm: (result) => {
                    setConfirm({ show: false, message: '', confirmText: 'Sí, eliminar', confirmVariant: 'danger', onConfirm: null });
                    resolve(result);
                }
            });
        });
    };

    return {
        toast,
        confirm,
        showSuccess,
        showError,
        hideToast,
        showConfirm,
    };
};
