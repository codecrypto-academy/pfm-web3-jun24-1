import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ethers } from "ethers";
import productManagerArtifact from "../../../artifacts/contracts/ProductManager.sol/ProductManager.json";
import userStorageArtifact from '../../../artifacts/contracts/UserStorage.sol/UserStorage.json';
import { productManagerAddress, userStorageAddress } from "../../../contractsInfo.json";

export function DashboardFabrTej() {
  const [nombreProducto, setNombreProducto] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [productManagerContract, setProductManagerContract] = useState(null);
  const [userStorageContract, setUserStorageContract] = useState(null);
  const [productos, setProductos] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [tailorAddress, setTailorAddress] = useState("");
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

        setProvider(provider);
        setSigner(signer);
        setProductManagerContract(productManagerContract);
        setUserStorageContract(userStorageContract);
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
    if (productManagerContract && userStorageContract) {
      try {
        const userAddress = await userStorageContract.getUsernameAddress(state.name);
        const tokenIds = await productManagerContract.getAllUserTokens(userAddress);

        const productosArray = [];

        for (let i = 0; i < tokenIds.length; i++) {
          const tokenId = tokenIds[i].toNumber();
          if (tokenId > 0) {
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
                estadoTexto = "En venta";
                break;
              case 6:
                estadoTexto = "Comprado";
                break;
              default:
                estadoTexto = "Desconocido";
                break;
            }

            productosArray.push({
              id: tokenId,
              nombre: productName,
              cantidad: parsedQuantity,
              estado: estadoTexto
            });
          }
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

  const handleTransferir = async () => {
    if (!selectedTokenId || !tailorAddress) {
      alert("Por favor seleccione un producto y especifique la dirección del confeccionista.");
      return;
    }
    if (productManagerContract) {
      try {
        const tokenIdToTransfer = selectedTokenId;
        const tx = await productManagerContract.transferToTailor(tailorAddress, tokenIdToTransfer);
        await tx.wait();
        alert(`Producto transferido al confeccionista ${tailorAddress}`);
        setShowModal(false);
        await loadProductos();
      } catch (error) {
        console.error("Error al transferir producto:", error);
        setErrorMessage(`Error al transferir producto: ${error.message}`);
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
          <h1 className="title-dashboard mb-3">MATERIALES</h1>
          <div className="">
            <table className="table table-striped table-dark table-bordered">
              <thead>
                <tr>
                  <th scope="col">Token</th>
                  <th scope="col">Nombre</th>
                  <th scope="col">m²</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto, index) => (
                  <tr key={producto.id}>
                    <td>{producto.id}</td>
                    <td>{producto.nombre}</td>
                    <td>{producto.cantidad}</td>
                    <td>{producto.estado}</td>
                    <td>
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          setSelectedTokenId(producto.id); // Al hacer clic, selecciona este tokenId
                          setShowModal(true);
                        }}
                      >
                        Transferir
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
                    Nombre del material:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="nombreProducto"
                    value={nombreProducto}
                    onChange={(e) => setNombreProducto(e.target.value)}
                    placeholder="Ingrese el nombre del material"
                  />
                </div>
              </div>

              <div className="col">
                <div className="mb-3">
                  <label htmlFor="cantidad" className="form-label">
                    Cantidad (en m²):
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="cantidad"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    placeholder="Ingrese la cantidad (en m²)"
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

        {showModal && (
          <div className="modal" style={{ display: "block" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Transferir Producto</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="tailorAddress" className="form-label">
                      Indique la cuenta del confeccionista:
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="tailorAddress"
                      value={tailorAddress}
                      onChange={(e) => setTailorAddress(e.target.value)}
                      placeholder="Ingrese la dirección del confeccionista"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleTransferir}>
                    Transferir
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
