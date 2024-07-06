import { Typewriter } from "react-simple-typewriter";
import { useForm } from "../hook/useForm";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import contractABI from '../../../artifacts/contracts/ProductManager.sol/UserStorage.json';
import { userStorageAddress } from '../../../contractsInfo.json';

export function Login() {
  const navigate = useNavigate();
  const { name, password, onInputChange, onResetForm } = useForm({
    name: "",
    password: "",
  });

  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
  // Dirección del contrato UserStorage.sol en tu red local
  // const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
  const userStorageContract = new ethers.Contract(userStorageAddress, contractABI.abi, provider);

  const onLogin = async (e) => {
    e.preventDefault();

    try {
      const userAddress = await userStorageContract.getUsernameAddress(name);
      if (userAddress !== ethers.constants.AddressZero) {
        const [address, , userRole] = await userStorageContract.login(userAddress, password);
        if (address === userAddress) {
          const normalizedRole = userRole.toLowerCase().trim();
          let dashboardRoute = ""; 

          switch (normalizedRole) {
            case "admin":
              dashboardRoute = "/register";
              break;
            case "fabricante":
              dashboardRoute = "/dashboardFabrTej";
              break;
            case "confeccionista":
              dashboardRoute = "/dashboardConfec";
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
              rol: normalizedRole // Guardamos el rol normalizado en minúsculas y sin espacios adicionales
            },
          });

          onResetForm();
        } else {
          alert("Contraseña incorrecta. Por favor, inténtalo de nuevo.");
        }
      } else {
        alert("Usuario no encontrado. Por favor, verifica tus credenciales.");
      }
    } catch (error) {
      console.error("Error al verificar usuario:", error);
      alert("Ocurrió un error al verificar el usuario. Por favor, inténtalo de nuevo.");
    }
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
                  " fabricante",
                  " confeccionista",
                  " comerciante",
                  " emprendedor",
                  " cliente",
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
            Compra y vende fácilmente con un solo click <br /> Sin intermediarios
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
          </form>
        </div>
      </div>
    </div>
  );
}
