import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { userStorageAddress } from '../../../contractsInfo.json';
import contractABI from '../../../artifacts/contracts/UserStorage.sol/UserStorage.json';
import { ethers } from "ethers";

export function Navbar() {
  const location = useLocation();
  const { logged, name, rol } = location.state || {
    logged: false,
    name: "",
    rol: "",
  };

  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
  const userStorageContract = new ethers.Contract(userStorageAddress, contractABI.abi, provider.getSigner());
  
  const navigate = useNavigate();
  
  const onLogout = async () => {
    try {
      const userAddress = await userStorageContract.getUsernameAddress(name);
      await userStorageContract.logout(userAddress);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("No se ha podido cerrar sesión", error);
    }
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
