import React from "react";
import styled from 'styled-components';

const SmartTextArea = ({...props}) => {
    const length = props.value && typeof(props.value) == "string" ? props.value.length : 0;
    return (
        <StyledTextArea>
            <div className="smart-text-area">
                <textarea maxLength={props.maxLength} {...props} />
                <span className={`count ${props.maxLength <= (length + 1) ? "text-danger" : props.maxLength < (length + 40) ? "text-warning" : "text-black"}`}>
                    {props.maxLength < (length + 40) && "Remaining: "} {props.maxLength - length}
                </span>
            </div>
        </StyledTextArea>
        
    );
}

const StyledTextArea = styled.div`
width: 100%;
.smart-text-area{
    position: relative;
    textarea{
        border-style: none;
        box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.4);
        border-radius:10px;
        padding: 15px;
        resize: none;
        width: -webkit-fill-available;
    }
    textarea:focus{
        outline: none;
    }
    .count{
        position: absolute;
        bottom: 10px;
        right: 20px;
        font-size: 80%;
        background: white;
    }
    .text-danger{
        color: #dc3545;
    }
    .text-warning{
        color: #ffc107 ;
    }
}
`

export default SmartTextArea;