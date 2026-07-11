import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../../../services/AuthService";

export const useRegisterForm = () => {
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            await register({ email, password, fullName });
            setSuccess("¡Registro exitoso! Redirigiendo al inicio de sesión...");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            console.error("Error en registro:", err);
            setError(err.response?.data?.message || "Error al registrarse. Intenta nuevamente.");
        }
    };

    return {
        email,
        setEmail,
        fullName,
        setFullName,
        password,
        setPassword,
        error,
        success,
        handleSubmit
    };
};

