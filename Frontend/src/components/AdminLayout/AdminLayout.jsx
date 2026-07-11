import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import '../../assets/admin-theme.css';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    React.useEffect(() => {
        document.body.classList.add('admin-body');
        return () => {
            document.body.classList.remove('admin-body');
        };
    }, []);

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="admin-layout-wrapper">
            {/* Overlay oscuro en mobile cuando el sidebar está abierto */}
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={closeSidebar} />
            )}

            <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

            <main className="admin-main-content">
                {/* Botón hamburguesa — solo visible en mobile/tablet */}
                <button
                    className="sidebar-toggle-btn"
                    onClick={() => setSidebarOpen(prev => !prev)}
                    aria-label="Abrir menú"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>

                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
