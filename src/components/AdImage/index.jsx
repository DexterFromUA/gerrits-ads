import React from "react";

import removeImage from '../../images/remove.png'

export default ({ image, onRemove }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        border: "1px solid black",
        borderRadius: 15,
        margin: 10,
        padding: 10,
        position: 'relative'
      }}
    >
      <img
        src={image}
        width={300}
        height={500}
        alt="preview"
        style={{
          objectFit: "contain",
        }}
      />

      <img
        src={removeImage}
        width={25}
        height={25}
        alt="preview"
        onClick={onRemove}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 99
        }}
      />
    </div>
  );
};
