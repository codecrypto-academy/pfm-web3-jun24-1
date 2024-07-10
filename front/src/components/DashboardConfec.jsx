import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ethers } from "ethers";
import productManagerArtifact from "../../../artifacts/contracts/ProductManager.sol/ProductManager.json";
import tailorArtifact from "../../../artifacts/contracts/Tailor.sol/Tailor.json";
import userStorageArtifact from "../../../artifacts/contracts/UserStorage.sol/UserStorage.json";
import {
  productManagerAddress,
  userStorageAddress,
  tailorAddress,
} from "../../../contractsInfo.json";

export function DashboardConfec() {
  const [nombreProductoNuevo, setNombreProductoNuevo] = useState("");
  const [cantidadNuevo, setCantidadNuevo] = useState("");
  const [precioNuevo, setPrecioNuevo] = useState("");
  const [signer, setSigner] = useState(null);
  const [productManagerContract, setProductManagerContract] = useState(null);
  const [userStorageContract, setUserStorageContract] = useState(null);
  const [tailorContract, setTailorContract] = useState(null);
  const [productosNoCreados, setProductosNoCreados] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const { state } = useLocation();
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [garments, setGarments] = useState([]);

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

        setSigner(signer);
        setProductManagerContract(productManagerContract);
        setUserStorageContract(userStorageContract);
        setTailorContract(tailorContract);
      } catch (error) {
        console.error("Error al inicializar ethers:", error);
        setErrorMessage(
          "Error al inicializar ethers. Asegúrese de que MetaMask esté instalado y conectado."
        );
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

        const productosNoCreadosArray = [];

        for (let i = 0; i < tokenIds.length; i++) {
          const tokenId = tokenIds[i].toNumber();
          if (tokenId > 0) {
            const [
              productName,
              productQuantity,
              productState,
            ] = await productManagerContract.getProduct(tokenIds[i], userAddress);
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

            const producto = {
              id: tokenId,
              nombre: productName,
              cantidad: parsedQuantity,
              estado: estadoTexto,
            };

            if (estadoTexto !== "Creado") {
              productosNoCreadosArray.push(producto);
            }
          }
        }

        setProductosNoCreados(productosNoCreadosArray);
      } catch (error) {
        console.error("Error al cargar materiales:", error);
        setErrorMessage(`Error al cargar materiales: ${error.message}`);
      }
    }
  };

  const loadGarments = async () => {
    if (tailorContract && userStorageContract) {
      try {
        const userAddress = await userStorageContract.getUsernameAddress(state.name);
        const tokenIds = await tailorContract.getAllUserTokens(userAddress);
  
        const garmentsArray = [];
  
        for (let i = 0; i < tokenIds.length; i++) {
          const tokenId = tokenIds[i].toNumber();
          if (tokenId > 0) {
            const [productName, productQuantity, productPrice] = await tailorContract.getGarment(tokenIds[i], userAddress);
            const parsedQuantity = parseInt(productQuantity);
            const parsedPrice = ethers.utils.formatEther(productPrice);
  
            // Filtrar productos con cantidad o precio igual a 0
            if (parsedQuantity > 0 && parseFloat(parsedPrice) >= 0) {
              const garment = {
                id: tokenId,
                nombre: productName,
                cantidad: parsedQuantity,
                precio: parsedPrice,
              };
  
              garmentsArray.push(garment);
            }
          }
        }
  
        setGarments(garmentsArray); // Actualiza garments solo con los productos válidos
      } catch (error) {
        console.error("Error al cargar productos creados:", error);
        setErrorMessage(`Error al cargar productos creados: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    loadProductos();
    loadGarments();
  }, [productManagerContract, userStorageContract, tailorContract]);

  const handleMint = async (event) => {
    event.preventDefault();
    if (!nombreProductoNuevo || !cantidadNuevo || !precioNuevo) {
      alert("Por favor complete todos los campos.");
      return;
    }
    if (tailorContract) {
      try {
        console.log("Dirección del usuario actual:", await signer.getAddress());
        const roleUser = await userStorageContract.getUserRole(
          signer.getAddress()
        );

        console.log(roleUser);

        const tx = await tailorContract.addGarment(
          nombreProductoNuevo,
          cantidadNuevo,
          ethers.utils.parseEther(precioNuevo),
          selectedTokenId
        );
        await tx.wait();
        alert("Producto minteado exitosamente");
        await loadGarments(); // Actualizar garments después de mintear
        await loadProductos();
        setNombreProductoNuevo("");
        setCantidadNuevo("");
        setPrecioNuevo("");
      } catch (error) {
        console.error("Error al mintear producto:", error);
        setErrorMessage(`Error al mintear producto: ${error.message}`);
      }
    } else {
      alert("Contrato no inicializado.");
    }
  };

  const handleAccept = async (tokenId) => {
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

  const handleSell = async (tokenId) => {
    if (!tokenId) {
      alert("Por favor seleccione un producto.");
      return;
    }
    if (tailorContract) {
      try {
        const tx = await tailorContract.setGarmentForSale(tokenId);
        await tx.wait();
        alert("Producto puesto en venta exitosamente");
        await loadGarments();
      } catch (error) {
        console.error("Error al poner en venta el producto:", error);
        setErrorMessage(`Error al poner en venta el producto: ${error.message}`);
      }
    } else {
      alert("Contrato no inicializado.");
    }
  };

  const handleCheckboxChange = (tokenId) => {
    setSelectedTokenId(tokenId);

    const selectedProduct = garments.find(
      (producto) => producto.id === tokenId
    );
    if (selectedProduct) {
      setNombreProductoNuevo(selectedProduct.nombre);
      setCantidadNuevo(selectedProduct.cantidad.toString());
      setPrecioNuevo(""); // Limpiar el precio cuando se selecciona un nuevo producto
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
        <div className="bg-dark rounded p-5 text-white m-5" id="productos-no-creados">
          <h1 className="title-dashboard mb-3">MATERIALES</h1>
          <div className="">
            <table className="table table-striped table-dark table-bordered">
              <thead>
                <tr>
                  <th scope="col" style={{ width: "50px" }}>Seleccionar</th>
                  <th scope="col">Token</th>
                  <th scope="col">Nombre</th>
                  <th scope="col">m²</th>
                  <th scope="col">Estado</th>
                  <th scope="col" style={{ width: "180px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosNoCreados.map((producto) => (
                  <tr key={producto.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedTokenId === producto.id}
                        onChange={() => handleCheckboxChange(producto.id)}
                      />
                    </td>
                    <td>{producto.id}</td>
                    <td>{producto.nombre}</td>
                    <td>{producto.cantidad}</td>
                    <td>{producto.estado}</td>
                    <td className="text-center">
                      {producto.estado === "Aceptado" && (
                        <span className="text-success fw-bold">Disponible</span>
                      )}
                      {producto.estado !== "Aceptado" && (
                        <>
                          <button
                            className="btn btn-success btn-sm me-2"
                            disabled={!selectedTokenId}
                            onClick={() => handleAccept(producto.id)}
                          >
                            Aceptar
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            disabled={!selectedTokenId}
                            onClick={() => handleReject(producto.id)}
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-dark rounded p-5 text-white m-5" id="mint">
          <h1 className="title-dashboard mb-3">FABRICAR</h1>
          <form onSubmit={handleMint}>
            <div className="row">
              <div className="col">
                <div className="mb-3">
                  <label htmlFor="nombreProductoNuevo" className="form-label">
                    Nombre del producto:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="nombreProductoNuevo"
                    value={nombreProductoNuevo}
                    onChange={(e) => setNombreProductoNuevo(e.target.value)}
                    placeholder="Ingrese el nombre del producto"
                  />
                </div>
              </div>

              <div className="col">
                <div className="mb-3">
                  <label htmlFor="cantidadNuevo" className="form-label">
                    Cantidad de prendas:
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="cantidadNuevo"
                    value={cantidadNuevo}
                    onChange={(e) => setCantidadNuevo(e.target.value)}
                    placeholder="Ingrese la cantidad (en m²)"
                  />
                </div>
              </div>

              <div className="col">
                <div className="mb-3">
                  <label htmlFor="precioNuevo" className="form-label">
                    Precio (en ETH):
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="precioNuevo"
                    value={precioNuevo}
                    onChange={(e) => setPrecioNuevo(e.target.value)}
                    placeholder="Ingrese el precio del producto"
                  />
                </div>
              </div>
            </div>

            <div className="text-center">
              <button type="submit" className="btn btn-primary">
                Crear
              </button>
            </div>
          </form>
        </div>

        <div className="bg-dark rounded p-5 text-white m-5 mb-0" id="producto-nuevo">
          <h1 className="title-dashboard mb-3">TUS PRODUCTOS</h1>
          <table className="table table-striped table-dark table-bordered mb-0">
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Cantidad</th>
                <th scope="col">Precio (ETH)</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {garments.map((producto) => (
                <tr key={producto.id}>
                  <td>{producto.nombre}</td>
                  <td>{producto.cantidad}</td>
                  <td>{producto.precio}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSell(producto.id)}
                    >
                      Vender
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
