import { Modal, Button } from 'react-bootstrap';

const ConfirmModal = ({ show, message, onConfirm, confirmText = 'Sí, eliminar', confirmVariant = 'danger' }) => {
    return (
        <Modal show={show} onHide={() => onConfirm(false)} centered>
            <Modal.Header closeButton>
                <Modal.Title className="d-flex align-items-center gap-2 fs-5">
                    <span className="material-symbols-outlined text-warning">warning</span>
                    <span>Confirmar acción</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="mb-0">{message}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => onConfirm(false)}>
                    Cancelar
                </Button>
                <Button variant={confirmVariant} onClick={() => onConfirm(true)}>
                    {confirmText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmModal;
