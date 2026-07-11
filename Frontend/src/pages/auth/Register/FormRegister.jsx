import { Container, Form, Button, Card, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useRegisterForm } from "./useRegisterForm";

const FormRegister = () => {
    const {
        email,
        setEmail,
        fullName,
        setFullName,
        password,
        setPassword,
        error,
        success,
        handleSubmit
    } = useRegisterForm();

    return (
        <Container className="mt-5 d-flex justify-content-center">
            <Card style={{ width: '500px' }}>
                <Card.Body>
                    <h2 className="text-center mb-4">Registro</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre Completo</Form.Label>
                            <Form.Control
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Ingresa tu nombre completo"
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Ingresa tu email"
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Contraseña</Form.Label>
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Crea una contraseña"
                                required
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100">
                            Registrarse
                        </Button>
                    </Form>

                    <div className="text-center mt-3">
                        <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default FormRegister;

