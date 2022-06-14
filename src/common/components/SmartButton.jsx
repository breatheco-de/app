import React from "react"
import { Button } from "@chakra-ui/react";
import Icon from "./Icon";
// import  './style.scss';
import PropTypes from 'prop-types';

const SmartButton = ({ children, variant, onClick, icon, className,onHover, ...rest }) => {
     
     return(
         <>
             <Button variant={`${!onHover ? "" : variant} shadow-one btn ${className}`} onClick={onClick} {...rest}>
                 {children}
                 {icon ? <Icon name={icon} size='md' /> : ""}
             </Button>
         </>
        
    )
}

SmartButton.HoverLayer = ({children, variant = "",className, ...rest}) => <div className={`hover-layer ${variant}${className}`} {...rest}>{children}</div>
SmartButton.Label = ({children, icon, variant = "",iconColor, ...rest}) => <>{icon ? <div className={`label-content ${variant}`} {...rest}><div><Icon name={icon} size='md' color={iconColor} /></div><label>{children}</label></div> : <label className={`button-label ${variant}`} {...rest}>{children}</label>}</>
SmartButton.Section = ({children, variant = "", ...rest}) => <div className={`button-section ${variant}`} {...rest}>{children}</div>

SmartButton.propTypes = {
    variant: PropTypes.string,
    children: PropTypes.node,
    onClick: PropTypes.func,
    icon: PropTypes.string,
    className: PropTypes.string,
    onHover: PropTypes.bool,
    iconColor:PropTypes.string
};

SmartButton.defaultProps = {
    variant: '',
    children: null,
    className: "",
    onHover: true
};

export default SmartButton;