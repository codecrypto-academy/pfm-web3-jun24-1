import "../index.css";
import { Typewriter } from "react-simple-typewriter";
import { useForm } from "../hook/useForm";
import { useNavigate } from "react-router-dom";

export function Login() {
  const navigate = useNavigate();

  const { name, rol, password, onInputChange, onResetForm } = useForm({
    name: "",
    rol: "",
    password: "",
  });

  const onLogin = (e) => {
    e.preventDefault();
  
    let dashboardRoute = ""; // Ruta por defecto
    
    switch (rol) {
      case "agricultor":
        dashboardRoute = "/dashboardAgr";
        break;
      case "fabricante":
        dashboardRoute = "/dashboardFabr";
        break;
      case "cliente":
        dashboardRoute = "/dashboardClient";
        break;
      default:
        dashboardRoute = "/dashboard";
    }
  
    navigate(dashboardRoute, {
      replace: true,
      state: {
        logged: true,
        name,
        rol
      },
    });
    
    onResetForm();
  };

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
          <p className="fixed-text">
            Compra y vende fácilmente con un solo click <br /> Sin
            intermediarios
          </p>
        </div>
      </div>
      <div className="form-container">
        <div className="container">
          <form onSubmit={onLogin}>
            <h1>Login</h1>
            <div className="input-box">
              <input
                type="text"
                placeholder="username"
                name="name"
                id="name"
                value={name}
                onChange={onInputChange}
                autoComplete="off"
                required
              />
            </div>
            <div className="input-box">
              <input
                type="text"
                placeholder="rol"
                name="rol"
                id="rol"
                value={rol}
                onChange={onInputChange}
                autoComplete="off"
                required
              />
            </div>
            <div className="input-box">
              <input
                type="password"
                placeholder="password"
                name="password"
                id="password"
                value={password}
                onChange={onInputChange}
                autoComplete="off"
                required
              />
            </div>
            <button type="submit" className="btn">
              Log in
            </button>
            <div className="register-link">
              <p>
                ¿No tienes una cuenta? <a href="/register">Regístrate aquí</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
