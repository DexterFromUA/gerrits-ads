import React from "react";

import { useNavigate } from "react-router-dom";

import { signUpManually, signInManually } from "../../services/fbService";

const Login = () => {
  const navigate = useNavigate();

  const [mail, setMail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSignUp = async () => {
    const result = await signUpManually(mail, password)

    if (result) {
      navigate('/');
    }
  }

  const handleSignIn = async () => {
    const result = await signInManually(mail, password)

    if (result) {
      navigate('/');
    }
  }

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
          placeholder="Mail"
          style={{ width: 250, height: 30, marginBottom: 10, paddingLeft: 5 }}
          onChange={(e) => setMail(e.target.value)}
          value={mail}
        />
        <input
          placeholder="Password"
          type="password"
          style={{ width: 250, height: 30, marginBottom: 10, paddingLeft: 5 }}
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
        <div
          onClick={handleSignIn}
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

        <div
          onClick={handleSignUp}
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
          Sing Up
        </div>
      </div>


    </div >
  );
};

export default Login;
