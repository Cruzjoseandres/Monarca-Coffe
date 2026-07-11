import { FormLabel } from "react-bootstrap";

const RequiredLabel = ({ htmlFor, children }) => {
    return (
        <FormLabel htmlFor={htmlFor}>
            {children}
            &nbsp;<span className="text-danger">*</span>
        </FormLabel>
    );
}

export default RequiredLabel;