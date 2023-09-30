import React from "react";

export default ({ list }) => {
  const [opened, setOpened] = React.useState(false);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();

        setOpened((prevState) => !prevState);
      }}
      style={{
        display: "flex",
        alignSelf: "flex-start",
        justifySelf: "flex-end",
        padding: 15,
        position: "relative",
      }}
    >
      <img
        src="https://cdn-icons-png.flaticon.com/512/126/126472.png"
        width={20}
        height={20}
        alt="settings"
      />

      {opened && (
        <div
          style={{
            position: "absolute",
            top: 45,
            border: "1px solid black",
            borderRadius: 10,
            backgroundColor: "white",
          }}
        >
          {list && list.length ? (
            list.map(({ text, onClick, style = {} }, index, arr) => (
              <div
                key={index}
                onClick={onClick}
                style={{
                  paddingLeft: 15,
                  paddingRight: 15,
                  paddingTop: 5,
                  paddingBottom: 5,
                  borderBottom: arr.length - 1 !== index && "1px solid black",
                  ...style,
                }}
              >
                {text}
              </div>
            ))
          ) : (
            <div>Empty</div>
          )}
        </div>
      )}
    </div>
  );
};
