import { useState } from "react";
import useAuthentication from "../../../../hooks/useAuthentication";

export const useLoginForm = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const { doLogin } = useAuthentication();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const success = await doLogin({ username, password });

        if (!success) {
            setError("Error al iniciar sesión. Verifica tus credenciales.");
        }
    };

    return {
        username,
        setUsername,
        password,
        setPassword,
        error,
        handleSubmit
    };
};
