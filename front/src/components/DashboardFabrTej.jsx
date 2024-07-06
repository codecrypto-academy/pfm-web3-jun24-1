import { useState, useEffect } from "react";
import { ethers } from "ethers";
import productManagerArtifact from "../../../artifacts/contracts/ProductManager.sol/ProductManager.json";
import { productManagerAddress, userStorageAddress } from "../../../contractsInfo.json";

// Dirección del contrato ProductManager en la red local de Hardhat
// const productManagerAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

export function DashboardAgr() {
  //Para almacenar el indice de la fila seleccionada de la tabla productos
  const [selectedRow, setSelectedRow] = useState(null);
  //Nombre y cantidad del producto
  const [nombreProducto, setNombreProducto] = useState("");
  const [cantidad, setCantidad] = useState("");
  //Proveedor de ethers y el objeto Signer para interactuar con la blockchain.
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  //Almacenar la instancia del contrato
  const [productManagerContract, setProductManagerContract] = useState(null);
  //Lista de productos
  const [productos, setProductos] = useState([]);
  //Mensajes de error
  const [errorMessage, setErrorMessage] = useState("");

  //Cuando se selecciona una fila en la tabla de productos 
  //actualiza el estado selectedRow con el índice de la fila seleccionada.
  const handleRowSelection = (index) => {
    setSelectedRow(index);
  };

  //conexión con MetaMask y el contrato ProductManager.
  const initializeEthers = async () => {
    //Verificamos si Metamask está disponible
    if (typeof window.ethereum !== "undefined") {
      try {
        //Proveedor
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        //Objeto signer para firmar transacciones
        const signer = provider.getSigner();
        //Instancia del contrato ProductManager
        const productManagerContract = new ethers.Contract(
          productManagerAddress,
          productManagerArtifact.abi,
          signer
        );

        /********************** Probar cuando tengamos la instancia del UserStorage en el ProductManager *******************************/
        // const productManagerFactory = new ethers.ContractFactory(productManagerArtifact.abi, productManagerArtifact.bytecode, signer);
        // const productManagerContract = await productManagerFactory.deploy(userStorageAddress);
        setProvider(provider);
        setSigner(signer);
        setProductManagerContract(productManagerContract);
      } catch (error) {
        console.error("Error al inicializar ethers:", error);
        setErrorMessage("Error al inicializar ethers. Asegúrese de que MetaMask esté instalado y conectado.");
      }
    } else {
      setErrorMessage("No se encontró ningún proveedor de Ethereum. Instale MetaMask.");
    }
  };

  //Inicializamos ethers una sola vez
  useEffect(() => {
    initializeEthers();
  }, []);

  //Cargar productos y actualizar el estado
  const loadProductos = async () => {
    //Comprobamos que productManagerContract está definido
    if (productManagerContract) {
      try {
        // Obtener tokens del usuario conectado
        const tokenIds = await productManagerContract.getAllUserTokens(signer.getAddress());

        // Obtener información de cada producto
        const productosArray = [];

        //Obtener el nombre y la cantidad de cada producto
        for (let i = 0; i < tokenIds.length; i++) {
          const [productName, productQuantity] = await productManagerContract.getProduct(tokenIds[i]);
          
          // Convertir productQuantity a un int
          const parsedQuantity = parseInt(productQuantity);

          //Actualiza el estado productos
          productosArray.push({
            id: tokenIds[i].toNumber(),  // Convertir tokenId a Number si es necesario
            nombre: productName,         // Asumiendo que productName es un string
            cantidad: parsedQuantity,    // Convertir productQuantity al tipo correcto
          });
        }

        setProductos(productosArray);
      } catch (error) {
        console.error("Error al cargar productos:", error);
        setErrorMessage(`Error al cargar productos: ${error.message}`);
      }
    }
  };

  //Se ejecuta cada vez que el signer cambia
  useEffect(() => {
    if (signer) {
      //Actualiza la lista de productos
      loadProductos();
    }
  }, [signer]); // Cargar productos cuando el signer cambie

  const handleMint = async (event) => {
    event.preventDefault();
    //Valores válidos
    if (!nombreProducto || !cantidad) {
      alert("Por favor complete todos los campos.");
      return;
    }
    if (productManagerContract) {
      try {
        // Añadir el prducto
        const tx = await productManagerContract.addProduct(nombreProducto, cantidad);
        await tx.wait();
        alert("Producto minteado exitosamente");
        
        // Recargar la lista de productos después de agregar uno nuevo
        await loadProductos();
      } catch (error) {
        console.error("Error al mintear producto:", error);
        setErrorMessage(`Error al mintear producto: ${error.message}`);
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
                  <th scope="col">Select</th>
                  <th scope="col">Token</th>
                  <th scope="col">Nombre</th>
                  <th scope="col">Kg</th>
                  <th scope="col">Estado</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto, index) => (
                  <tr key={producto.id}>
                    <td className="m-3">
                      <input
                        type="checkbox"
                        checked={selectedRow === index + 1}
                        onChange={() => handleRowSelection(index + 1)}
                      />
                    </td>
                    <td>{producto.id}</td>
                    <td>{producto.nombre}</td>
                    <td>{producto.cantidad}</td>
                    {/* Agrega el estado del producto si es necesario */}
                    <td>Estado</td>
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
                    Cantidad:
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

        <div className="bg-dark rounded p-5 text-white m-5" id="transferir">
          <h1 className="title-dashboard mb-3">TRANSFERIR</h1>
          <div className="mt-3 text-center">
            <div className="mb-3">
              <label htmlFor="exampleLabel" className="form-label">Seleccione un token a transferir:</label>
            </div>
            <button type="button" className="btn btn-primary">Transferir</button>
          </div>
        </div>
      </div>
    </div>
  );
}
