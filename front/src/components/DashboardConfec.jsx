import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ethers } from "ethers";
import productManagerArtifact from "../../../artifacts/contracts/ProductManager.sol/ProductManager.json";
import tailorArtifact from "../../../artifacts/contracts/Tailor.sol/Tailor.json";
import userStorageArtifact from '../../../artifacts/contracts/UserStorage.sol/UserStorage.json';
import { productManagerAddress, userStorageAddress, tailorAddress } from "../../../contractsInfo.json";

export function DashboardConfec() {
  const [nombreProducto, setNombreProducto] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [productManagerContract, setProductManagerContract] = useState(null);
  const [userStorageContract, setUserStorageContract] = useState(null);
  const [tailorContract, setTailorContract] = useState(null);
  const [productos, setProductos] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const { state } = useLocation();
  const [selectedTokenId, setSelectedTokenId] = useState(null); // Estado para almacenar el tokenId seleccionado

  const initializeEthers = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const productManagerContract = new ethers.Contract(
          productManagerAddress,
          productManagerArtifact.abi,
          signer
        );

        const userStorageContract = new ethers.Contract(
          userStorageAddress, 
          userStorageArtifact.abi, 
          signer
        );

        const tailorContract = new ethers.Contract(
          tailorAddress, 
          tailorArtifact.abi, 
          signer
        );

        setProvider(provider);
        setSigner(signer);
        setProductManagerContract(productManagerContract);
        setUserStorageContract(userStorageContract);
        setTailorContract(tailorContract);
      } catch (error) {
        console.error("Error al inicializar ethers:", error);
        setErrorMessage("Error al inicializar ethers. Asegúrese de que MetaMask esté instalado y conectado.");
      }
    } else {
      setErrorMessage("No se encontró ningún proveedor de Ethereum. Instale MetaMask.");
    }
  };

  useEffect(() => {
    initializeEthers();
  }, []);

  const loadProductos = async () => {
    if (productManagerContract && userStorageContract && tailorContract) {
      try {
        const userAddress = await userStorageContract.getUsernameAddress(state.name);
        const tokenIds = await productManagerContract.getAllUserTokens(userAddress);
        
        const productosArray = [];

        for (let i = 0; i < tokenIds.length; i++) {
          const [productName, productQuantity, productState] = await productManagerContract.getProduct(tokenIds[i], userAddress);
          const parsedQuantity = parseInt(productQuantity);

          let estadoTexto = "";
          switch (productState) {
            case 0:
              estadoTexto = "Creado";
              break;
            case 1:
              estadoTexto = "Pendiente";
              break;
            case 2:
              estadoTexto = "Aceptado";
              break;
            case 3:
              estadoTexto = "Rechazado";
              break;
            case 4:
              estadoTexto = "Eliminado";
              break;
            case 5:
              estadoTexto = "Venta";
              break;
            case 6:
              estadoTexto = "Comprado";
              break;
            default:
              estadoTexto = "Desconocido";
          }

          productosArray.push({
            id: tokenIds[i].toNumber(),
            nombre: productName,
            cantidad: parsedQuantity,
            estado: estadoTexto
          });
        }

        setProductos(productosArray);
      } catch (error) {
        console.error("Error al cargar productos:", error);
        setErrorMessage(`Error al cargar productos: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    loadProductos();
  }, [productManagerContract, userStorageContract]);

  const handleMint = async (event) => {
    event.preventDefault();
    if (!nombreProducto || !cantidad) {
      alert("Por favor complete todos los campos.");
      return;
    }
    if (productManagerContract) {
      try {
        const tx = await productManagerContract.addProduct(nombreProducto, cantidad);
        await tx.wait();
        alert("Producto minteado exitosamente");
        await loadProductos();
      } catch (error) {
        console.error("Error al mintear producto:", error);
        setErrorMessage(`Error al mintear producto: ${error.message}`);
      }
    } else {
      alert("Contrato no inicializado.");
    }
  };

  const handleAccept = async (tokenId) => {
    console.log(tokenId);
    if (!tokenId) {
      alert("Por favor seleccione un producto.");
      return;
    }
    if (tailorContract) {
      try {
        const tx = await tailorContract.acceptProduct(tokenId);
        await tx.wait();
        alert("Producto aceptado exitosamente");
        await loadProductos();
      } catch (error) {
        console.error("Error al aceptar producto:", error);
        setErrorMessage(`Error al aceptar producto: ${error.message}`);
      }
    } else {
      alert("Contrato no inicializado.");
    }
  };

  const handleReject = async (tokenId) => {
    if (!tokenId) {
      alert("Por favor seleccione un producto.");
      return;
    }
    if (tailorContract) {
      try {
        const tx = await tailorContract.rejectProduct(tokenId);
        await tx.wait();
        alert("Producto rechazado exitosamente");
        await loadProductos();
      } catch (error) {
        console.error("Error al rechazar producto:", error);
        setErrorMessage(`Error al rechazar producto: ${error.message}`);
      }
    } else {
      alert("Contrato no inicializado.");
    }
  };

  return (
    <div className="bg-fondo">
      <div className="bg-dash">
        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}
        <div className="bg-dark rounded p-5 text-white m-5" id="productos">
          <h1 className="title-dashboard mb-3">PRODUCTOS</h1>
          <div className="">
            <table className="table table-striped table-dark table-bordered">
              <thead>
                <tr>
                  <th scope="col">Token</th>
                  <th scope="col">Nombre</th>
                  <th scope="col">m/2</th>
                  <th scope="col">Estado</th>
                  <th scope="col" style={{ width: "180px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto, index) => (
                  <tr key={producto.id}>
                    <td>{producto.id}</td>
                    <td>{producto.nombre}</td>
                    <td>{producto.cantidad}</td>
                    <td>{producto.estado}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={() => handleAccept(producto.id)} // Pasa el tokenId como argumento
                      >
                        Aceptar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleReject(producto.id)} // Pasa el tokenId como argumento
                      >
                        Rechazar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-dark rounded p-5 text-white m-5" id="mint">
          <h1 className="title-dashboard mb-3">MINT</h1>
          <form onSubmit={handleMint}>
            <div className="row">
              <div className="col">
                <div className="mb-3">
                  <label htmlFor="nombreProducto" className="form-label">
                    Nombre del producto:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="nombreProducto"
                    value={nombreProducto}
                    onChange={(e) => setNombreProducto(e.target.value)}
                    placeholder="Ingrese el nombre del producto"
                  />
                </div>
              </div>

              <div className="col">
                <div className="mb-3">
                  <label htmlFor="cantidad" className="form-label">
                    Cantidad (en m/2):
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="cantidad"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    placeholder="Ingrese la cantidad (en kg)"
                  />
                </div>
              </div>
            </div>

            <div className="text-center">
              <button type="submit" className="btn btn-primary">
                Mintear
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
