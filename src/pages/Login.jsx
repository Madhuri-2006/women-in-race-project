import Layout from "../components/Layout/Layout";
import "./Login.css";

function Login() {
  return (
    <Layout>
      <div className="login-page">
        <div className="login-box">

          <h1>Login</h1>

          <p>Firebase Authentication Coming Next</p>

          <input
            type="email"
            placeholder="Email"
          />

          <input
            type="password"
            placeholder="Password"
          />

          <button>Login</button>

        </div>
      </div>
    </Layout>
  );
}

export default Login;