import { Outlet, useLocation, useNavigate } from "react-router-dom";

export function Navbar() {
  const location = useLocation();
  const { logged, name, rol } = location.state || {
    logged: false,
    name: "",
    rol: "",
  };

  const navigate = useNavigate();

  const onLogout = () => {
    navigate("/", { replace: true });
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light navbar-dark bg-dark p-3">
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNavAltMarkup"
          aria-controls="navbarNavAltMarkup"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div className="navbar-nav ms-auto">
            {logged ? (
              <>
                <span className="nav-item nav-link active">{name}</span>
                <span className="nav-item nav-link active">{rol}</span>
                <button type="button" className="btn btn-outline-light ms-3" onClick={onLogout}>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
              </>
            )}
          </div>
        </div>
      </nav>
      <Outlet />
    </>
  );
}
