import { useState, useEffect } from 'react';

export const usePWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            // Prevenir que Chrome muestre el mini-infobar automáticamente
            e.preventDefault();
            // Guardar el evento para poder dispararlo luego
            setDeferredPrompt(e);
            // Mostrar la UI u opción de instalación
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Detectar si la app ya fue instalada
        window.addEventListener('appinstalled', () => {
            setDeferredPrompt(null);
            setIsInstallable(false);
            console.log('PWA fue instalada exitosamente');
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const installPWA = async () => {
        if (!deferredPrompt) return;
        
        // Disparar el prompt nativo
        deferredPrompt.prompt();
        
        // Esperar la respuesta del usuario
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('El usuario aceptó la instalación de la PWA');
        } else {
            console.log('El usuario rechazó la instalación de la PWA');
        }
        
        // Limpiamos el prompt ya que solo se puede usar una vez
        setDeferredPrompt(null);
        setIsInstallable(false);
    };

    return { isInstallable, installPWA };
};
