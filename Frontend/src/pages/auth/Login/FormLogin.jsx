import { Container, Form, Button, Card, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useLoginForm } from "./useLoginForm";

const FormLogin = () => {
    const {
        username,
        setUsername,
        password,
        setPassword,
        error,
        handleSubmit
    } = useLoginForm();

    return (
        <Container className="mt-5 d-flex justify-content-center align-items-center fade-in" style={{ minHeight: '70vh' }}>
            <Card className="login-card">
                <Card.Body>
                    <div className="text-center mb-4">
                        <div className="login-icon-wrapper">
                            <span className="material-symbols-outlined" style={{ fontSize: '3rem' }}>coffee_maker</span>
                        </div>
                        <h2 className="mb-2">Cafetería</h2>
                        <p className="text-muted-custom">Ingresa tus credenciales para acceder</p>
                    </div>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Usuario</Form.Label>
                            <Form.Control
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Ingresa tu usuario"
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Contraseña</Form.Label>
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Ingresa tu contraseña"
                                required
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100 mt-4 py-2">
                            Iniciar Sesión
                        </Button>
                        <div className="text-center mt-4">
                            <Link to="/menu" className="text-decoration-none d-inline-flex align-items-center gap-1 font-weight-bold" style={{ color: 'var(--primary-color)' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>restaurant_menu</span>
                                Ver Menú del día
                            </Link>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default FormLogin;
