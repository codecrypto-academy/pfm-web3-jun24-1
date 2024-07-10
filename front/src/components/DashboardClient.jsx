import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ethers } from "ethers";
import tailorArtifact from "../../../artifacts/contracts/Tailor.sol/Tailor.json";
import userStorageArtifact from "../../../artifacts/contracts/UserStorage.sol/UserStorage.json";
import {
  userStorageAddress,
  tailorAddress,
} from "../../../contractsInfo.json";

export function DashboardClient() {
  const [errorMessage, setErrorMessage] = useState("");
  const [userStorageContract, setUserStorageContract] = useState(null);
  const [tailorContract, setTailorContract] = useState(null);
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [garmentsForSale, setGarmentsForSale] = useState([]);
  const [soldGarments, setSoldGarments] = useState([]);
  const [allTraceabilityRecords, setAllTraceabilityRecords] = useState([]);

  const { state } = useLocation();

  const initializeEthers = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();

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

  const getState = (state) => {
    switch (state) {
      case 0:
        return "Creado";
      case 1:
        return "Pendiente";
      case 2:
        return "Aceptado";
      case 3:
        return "Rechazado";
      case 4:
        return "Eliminado";
      case 5:
        return "En venta";
      case 6:
        return "Comprado";
      default:
        return "Desconocido";
    }
  }

  const loadGarmentsForSale = async () => {
    if (tailorContract && userStorageContract) {
      try {
        const allUsers = await userStorageContract.getAllUsers();
        const allTailorAddresses = allUsers.filter(user => user.role === "Confeccionista").map(user => user.userAddress);

        for (const tailorAddress of allTailorAddresses) {
                 
          const tokenIds = await tailorContract.getAllTokensIdsForSale(tailorAddress);
    
          const garmentsArray = [];
    
          for (let i = 0; i < tokenIds.length; i++) {
            const tokenId = tokenIds[i].toNumber();
            if (tokenId > 0) {
              const [garmentName, garmentQuantity, garmentPrice, garmentOrigin, garmentState] = await tailorContract.getGarment(tokenIds[i], tailorAddress);
              const parsedQuantity = parseInt(garmentQuantity);
              const parsedPrice = ethers.utils.formatEther(garmentPrice);
    
              // Filtrar productos con cantidad o precio igual a 0
              if (parsedQuantity > 0 && parseFloat(parsedPrice) > 0) {
                const garment = {
                  id: tokenId,
                  nombre: garmentName,
                  cantidad: parsedQuantity,
                  precio: parsedPrice,
                  origen: garmentOrigin.toNumber(),
                  estado: getState(garmentState)
                };
    
                garmentsArray.push(garment);
              }
            }
          }

          setGarmentsForSale(garmentsArray); // Actualiza garmentsForSale solo con los productos válidos
        }
  
      } catch (error) {
        console.error("Error al cargar productos creados:", error);
        setErrorMessage(`Error al cargar productos creados: ${error.message}`);
      }
    }
  };

  const loadSoldGarments = async () => {
    if (tailorContract && userStorageContract) {
      try {
        const userAddress = await userStorageContract.getUsernameAddress(state.name);
        const tokenIds = await tailorContract.getAllUserTokens(userAddress);
  
        const garmentsArray = [];
  
        for (let i = 0; i < tokenIds.length; i++) {
          const tokenId = tokenIds[i].toNumber();
          if (tokenId > 0) {
            const [garmentName, garmentQuantity, garmentPrice, garmentOrigin, garmentState] = await tailorContract.getGarment(tokenIds[i], userAddress);
            const estado = getState(garmentState);

            if (estado !== "Comprado") continue;

            const parsedQuantity = parseInt(garmentQuantity);
            const parsedPrice = ethers.utils.formatEther(garmentPrice);
  
            // Filtrar productos con cantidad o precio igual a 0
            if (parsedQuantity > 0 && parseFloat(parsedPrice) >= 0) {
              const garment = {
                id: tokenId,
                nombre: garmentName,
                cantidad: parsedQuantity,
                precio: parsedPrice,
                origen: garmentOrigin.toNumber(),
                estado
              };

              garmentsArray.push(garment);
            }
          }
        }
  
        setSoldGarments(garmentsArray); // Actualiza garments solo con los productos válidos
      } catch (error) {
        console.error("Error al cargar productos creados:", error);
        setErrorMessage(`Error al cargar productos creados: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    loadGarmentsForSale();
    loadSoldGarments();
  }, [userStorageContract, tailorContract]);

  const handleBuy = async (tokenId, precio) => {
    if (!tokenId) {
      alert("Por favor seleccione un garment.");
      return;
    }

    if (tailorContract) {
      try {
        const tx = await tailorContract.buyToken(tokenId, {
          value: ethers.utils.parseEther(precio.toString())
        });
        await tx.wait();
        alert("Prenda vendida exitosamente");
        await loadGarmentsForSale();
        await loadSoldGarments();
        setSelectedTokenId(null);
      } catch (error) {
        console.error("Error al vender la prenda:", error);

        if (error.error && error.error.message) {
          console.error("Mensaje de error interno:", error.error.message);
        }

        setErrorMessage(`Error al vender la prenda: ${error.message}`);
      }
    } else {
      alert("Contrato no inicializado.");
    }
  }

  const handleCheckboxChange = async (tokenId, origen) => {
    setSelectedTokenId(tokenId);
    
    const traceabilityRecords = await tailorContract.getTokenTraceabilityById(tokenId);
    const originTraceabilityRecords = await tailorContract.getTokenTraceabilityById(origen);
    const mergedTraceabilityRecords = [...originTraceabilityRecords, ...traceabilityRecords]; 

    setAllTraceabilityRecords(mergedTraceabilityRecords);
  };

  return (
    <div className="bg-fondo">
      <div className="bg-dash">
        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}
        <div
          className="bg-dark rounded p-5 text-white m-5"
          id="prendas-en-venta"
        >
          <h1 className="title-dashboard mb-3">CATÁLOGO</h1>
          <div className="">
            <table className="table table-striped table-dark table-bordered">
              <thead>
                <tr>
                  <th scope="col" style={{ width: "50px" }}>
                    Seleccionar
                  </th>
                  <th scope="col">Token</th>
                  <th scope="col">Nombre</th>
                  <th scope="col">Cantidad</th>
                  <th scope="col">Precio (ETH)</th>
                  <th scope="col">Estado</th>
                  <th scope="col" style={{ width: "180px" }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {garmentsForSale.map((garment) => (
                  <tr key={garment.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedTokenId === garment.id}
                        onChange={() => handleCheckboxChange(garment.id, garment.origen)}
                      />
                    </td>
                    <td>{garment.id}</td>
                    <td>{garment.nombre}</td>
                    <td>{garment.cantidad}</td>
                    <td>{garment.precio}</td>
                    <td>{garment.estado}</td>
                    <td className="text-center">
                      {garment.estado === "En venta" && (
                        <>
                          <button
                            className="btn btn-success btn-sm me-2"
                            disabled={!selectedTokenId || selectedTokenId !== garment.id}
                            onClick={() => handleBuy(garment.id, garment.precio)}
                          >
                            Comprar
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

        <div
          className="bg-dark rounded p-5 text-white m-5"
          id="prendas-vendidas"
        >
          <h1 className="title-dashboard mb-3">PRENDAS VENDIDAS</h1>
          <div className="">
            <table className="table table-striped table-dark table-bordered">
              <thead>
                <tr>
                  <th scope="col" style={{ width: "50px" }}>Seleccionar</th>
                  <th scope="col">Token</th>
                  <th scope="col">Nombre</th>
                  <th scope="col">Cantidad</th>
                  <th scope="col">Precio (ETH)</th>
                  <th scope="col">Estado</th>
                </tr>
              </thead>
              <tbody>
                {soldGarments.map((garment) => (
                  <tr key={garment.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedTokenId === garment.id}
                        onChange={() => handleCheckboxChange(garment.id, garment.origen)}
                      />
                    </td>
                    <td>{garment.id}</td>
                    <td>{garment.nombre}</td>
                    <td>{garment.cantidad}</td>
                    <td>{garment.precio}</td>
                    <td>{garment.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedTokenId && allTraceabilityRecords && allTraceabilityRecords.length > 0 && (
          <div
            className="bg-dark rounded p-5 text-white m-5"
            id="prendas-en-venta"
          >
            <h1 className="title-dashboard mb-3">TRAZABILIDAD</h1>

            {allTraceabilityRecords.map((record, index) => (
              <div key={index} className={`card text-center ${index < allTraceabilityRecords.length - 1 ? 'mb-3' : ''}`} style={{ width: "100%" }}>
                <div className="card-body">
                  <h5 className="card-title">Token id: { selectedTokenId }</h5>
                  <p className="card-text">Creado por: { record.createdBy }</p>
                  <p className="card-text">Token de origen: { record.origin.toNumber() }</p>
                  <p className="card-text">Cantidad: { record.quantity.toNumber() }</p>
                  <p className="card-text">Producto: { record.productName }</p>
                  <p className="card-text">Estado: { getState(record.state) }</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
