const FormLabel = ({ txtRelacionado, texto }) => {
    return (
        <label className="label" htmlFor={txtRelacionado}>{texto}</label>
    );
}

export default FormLabel;