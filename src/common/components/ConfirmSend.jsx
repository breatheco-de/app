import { useState } from "react";
import Button from "./SmartButton";
import PropTypes from 'prop-types';

const ConfirmSend = ({ onSubmit, label, className }) => {

    const [confirm, setConfirm] = useState();

    return <>
        {!confirm ?
            <Button className={`p-4 ${className}`} icon="arrow" variant="primary" onClick={() => setConfirm(true)}>
                <Button.Label className="question">
                    {label}
                </Button.Label>
            </Button>
            :
            <Button className={`${className} p-4`} icon="arrow" variant="primary">
                <Button.Label className="confirmation">
                    {"Are you sure ?"}
                </Button.Label>
                <Button.HoverLayer className="visible">
                    <Button.Label icon="check-mark" className="pt-1 pl-3 pr-3 bg-success-light" onClick={() => {
                        onSubmit(true); setConfirm(false);
                    }}>
                        {"yes"}
                    </Button.Label>
                    <Button.Label icon="fix" iconColor="red" className="pt-1 pl-3 pr-3 bg-danger-light" onClick={() => setConfirm(false)}>
                        {"no"}
                    </Button.Label>
                </Button.HoverLayer>
            </Button>}
    </>
}

ConfirmSend.propTypes = {
    onSubmit: PropTypes.func,
    label: PropTypes.string,
    className: PropTypes.string,
};

ConfirmSend.defaultProps = {
    onSubmit: ()=>{},
    label: "",
    className: "",
};

export default ConfirmSend;