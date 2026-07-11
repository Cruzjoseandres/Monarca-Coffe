import { FormControl } from 'react-bootstrap';
import lupa from '../assets/lupa.png';
import PropTypes from 'prop-types';
const SearchTextField = ({ text, className, onTextChanged }) => {
    return (
        <div className={`searchTextField ${className}`}>
            <FormControl type="text" placeholder="Buscar..." value={text} onChange={onTextChanged} />
            <img src={lupa} alt="Buscar" />
        </div>
    );
}
SearchTextField.propTypes = {
    /**
     * Texto del campo de búsqueda
     */
    text: PropTypes.string,
    /**
     * Clase CSS adicional para el componente
     */
    className: PropTypes.string,
    /**
     * Función que se llama cuando cambia el texto del campo de búsqueda
     */
    onTextChanged: PropTypes.func.isRequired,
}
export default SearchTextField;