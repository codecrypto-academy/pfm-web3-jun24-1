import "../index.css";
import { Typewriter } from "react-simple-typewriter";

export function Login() {
  return (
    <div className="page-container">
      <div>
        <div className="typewriter-container">
          <h1 className="typewriter">
            Yo soy
            <span className="spanTypewritter">
              <Typewriter
                words={[
                  " agricultor",
                  " ganadero",
                  " comerciante",
                  " emprendedor",
                  " artesano",
                  " diseñador/a de moda",
                  " escritor",
                ]}
                loop={true}
                cursor
                cursorStyle="|"
                typeSpeed={70}
                deleteSpeed={50}
                delaySpeed={1000}
                textAlign="left" // Alinear el Typewriter a la izquierda
              />
            </span>
          </h1>
        </div>
        <div>
            <p className="fixed-text">Compra y vende fácilmente con un solo click <br /> Sin intermediarios</p>
        </div>
      </div>
      <div className="form-container">
        <div className="container">
          <form action="#">
            <h1>Login</h1>
            <div className="input-box">
              <input type="text" placeholder="username" required />
            </div>
            <div className="input-box">
              <input type="password" placeholder="password" required />
            </div>
            <button type="submit" className="btn">
              Log in
            </button>
            <div className="register-link">
              <p>
                ¿No tienes una cuenta? <a href="#">Regístrate aquí</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
