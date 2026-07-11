import { Toast, ToastContainer } from 'react-bootstrap';

const NotificationToast = ({ show, message, variant, onClose }) => {
    const icons = {
        success: 'check_circle',
        danger: 'error',
        warning: 'warning',
        info: 'info',
    };

    const iconColors = {
        success: 'text-success',
        danger: 'text-danger',
        warning: 'text-warning',
        info: 'text-info',
    };

    return (
        <ToastContainer position="top-end" className="p-3 position-fixed" style={{ zIndex: 999999, top: '10px', right: '10px' }}>
            <Toast
                show={show}
                onClose={onClose}
                delay={4000}
                autohide
                className="shadow border-0"
            >
                <Toast.Header closeButton>
                    <div className="d-flex align-items-center gap-2 me-auto">
                        <span className={`material-symbols-outlined ${iconColors[variant] || 'text-dark'}`}>
                            {icons[variant] || 'notifications'}
                        </span>
                        <strong className="text-dark">
                            {variant === 'success' ? 'Éxito' : variant === 'danger' ? 'Error' : 'Aviso'}
                        </strong>
                    </div>
                </Toast.Header>
                <Toast.Body 
                    className="fw-bold" 
                    style={{ 
                        fontSize: '1.1rem',
                        color: variant === 'success' || variant === 'danger' ? '#ffffff' : '#000000',
                        backgroundColor: variant === 'success' ? '#198754' : variant === 'danger' ? '#dc3545' : '#f8f9fa'
                    }}
                >
                    {message}
                </Toast.Body>
            </Toast>
        </ToastContainer>
    );
};

export default NotificationToast;
