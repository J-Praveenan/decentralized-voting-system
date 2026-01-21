import React, {useContext} from "react";

//--- INTERNAL IMPORT
import Style from './Input.module.css';

const Input = ({ inputType, title, placeholder, handleClick }) => {
  return (
    <div>
      <p>{title}</p>

      {inputType === "text" ? (
        <div className={Style.input__box}>
          <input
            type="text"
            placeholder={placeholder}
            onChange={handleClick}
          />
        </div>
      ):("")}
    </div>
  );
};

export default Input;
