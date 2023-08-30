import React from "react";

const Login = () => {
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <div>
        <h1>Darts admin</h1>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          alignSelf: "center",
          justifyContent: "center",
          justifySelf: "center",
          position: 'absolute',
          top: '45%'
        }}
      >
        <input
          placeholder="Login"
          style={{ width: 250, height: 30, marginBottom: 10, paddingLeft: 5 }}
        />
        <input
          placeholder="Password"
          type="password"
          style={{ width: 250, height: 30, marginBottom: 10, paddingLeft: 5 }}
        />
        <div
          onClick={() => console.log("clicked")}
          style={{
            border: "1px solid black",
            borderRadius: 10,
            padding: 7,
            cursor: "pointer",
            width: 70,
            alignSelf: 'flex-end',
            textAlign: 'center'
          }}
        >
          Sing In
        </div>
      </div>


    </div >
  );
};

export default Login;
