import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import supplyChainArtifact from "../../../artifacts/contracts/SupplyChain.sol/SupplyChain.json";

const supplyChainAddress = "0x5081a39b8A5f0E35a8D959395a630b68B74Dd30f";
const Material = ["Algodón", "Seda", "Lino"];

export function DashboardAgr() {
  const [selectedRow, setSelectedRow] = useState(null);
  const [materialIndex, setMaterialIndex] = useState(""); // Índice del material seleccionado
  const [cantidadKg, setCantidadKg] = useState(""); // Cantidad en kilogramos
  const [precioEth, setPrecioEth] = useState(""); // Precio en ETH
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [supplyChainContract, setSupplyChainContract] = useState(null);
  const [productos, setProductos] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRowSelection = (index) => {
    setSelectedRow(index);
  };

  const initializeEthers = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const supplyChainContract = new ethers.Contract(
          supplyChainAddress,
          supplyChainArtifact.abi,
          signer
        );
        setProvider(provider);
        setSigner(signer);
        setSupplyChainContract(supplyChainContract);
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
    if (supplyChainContract && signer) {
      try {
        const productosArray = [];
        const manufacturerMaterials = await supplyChainContract.getRawMaterialsByManufacturer(await signer.getAddress());
        for (let i = 0; i < manufacturerMaterials.length; i++) {
          const materialId = manufacturerMaterials[i];
          const [materialType, quantity, productionDate, price, producer] = await supplyChainContract.rawMaterials(materialId);

          productosArray.push({
            id: materialId.toString(),
            materialType: materialType,
            cantidadKg: quantity.toString(), // Mostrar la cantidad exacta como string
            price: ethers.utils.formatEther(price), // Convertir el precio a Ether y mostrar como string
            productionDate: new Date(parseInt(productionDate) * 1000).toLocaleString(), // Convertir la fecha UNIX a legible
            estado: "Estado" // Agregar lógica para obtener el estado del producto si es necesario
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
    if (signer) {
      loadProductos();
    }
  }, [signer]);

  const handleAddMaterial = async (event) => {
    event.preventDefault();
    if (materialIndex === "" || cantidadKg === "" || precioEth === "") {
      setErrorMessage("Por favor complete todos los campos.");
      return;
    }
    if (supplyChainContract) {
      try {
        console.log(`Añadiendo material: ${Material[materialIndex]}, cantidad: ${cantidadKg} kg, precio: ${precioEth} ETH`);

        const cantidadEnUnidades = ethers.utils.parseUnits(cantidadKg.toString(), 'wei'); // Convertir cantidad a unidades (wei)

        const precioEnWei = ethers.utils.parseUnits(precioEth.toString(), 'ether'); // Convertir precio a wei

        const tx = await supplyChainContract.produceRawMaterial(
          materialIndex,
          cantidadEnUnidades,
          precioEnWei,
          {
            gasLimit: 300000, // Ajustar el límite de gas según sea necesario
          }
        );
        await tx.wait();
        alert("Material añadido exitosamente");
        await loadProductos(); // Volver a cargar productos después de agregar uno nuevo
      } catch (error) {
        console.error("Error al añadir material:", error);
        setErrorMessage(`Error al añadir material: ${error.message}`);
      }
    } else {
      setErrorMessage("Contrato no inicializado.");
    }
  };

  return (
    <div className="bg-fondo">
      <div className="bg-dash">
        {errorMessage && (
          <div className="alert alert-danger m-5" role="alert">
            {errorMessage}
          </div>
        )}

        <div className="bg-dark rounded p-5 text-white m-5" id="productos">
          <h1 className="title-dashboard mb-3">MATERIALES</h1>
          <div className="">
            <table className="table table-striped table-dark table-bordered">
              <thead>
                <tr>
                  <th scope="col">Select</th>
                  <th scope="col">Token</th>
                  <th scope="col">Nombre</th>
                  <th scope="col">Kg</th>
                  <th scope="col">Precio</th>
                  <th scope="col">Fecha de Creación</th>
                  <th scope="col">Estado</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto, index) => (
                  <tr key={producto.id}>
                    <td className="m-3">
                      <input
                        type="checkbox"
                        checked={selectedRow === index}
                        onChange={() => handleRowSelection(index)}
                      />
                    </td>
                    <td>{producto.id}</td>
                    <td>{Material[producto.materialType]}</td>
                    <td>{producto.cantidadKg}</td> {/* Mostrar la cantidad ingresada seguida de "kg" */}
                    <td>{producto.price} ETH</td> {/* Mostrar el precio del material */}
                    <td>{producto.productionDate}</td> {/* Mostrar la fecha de creación del material */}
                    <td>{producto.estado}</td> {/* Agregar el estado del producto si es necesario */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-dark rounded p-5 text-white m-5" id="mint">
          <h1 className="title-dashboard mb-3">AÑADE TU MATERIAL</h1>
          <form onSubmit={handleAddMaterial}>
            <div className="row">
              <div className="col">
                <div className="mb-3">
                  <label htmlFor="material" className="form-label">
                    Material:
                  </label>
                  <select
                    id="material"
                    className="form-select"
                    value={materialIndex}
                    onChange={(e) => setMaterialIndex(parseInt(e.target.value))}
                  >
                    <option value="">Seleccionar material</option>
                    <option value="0">Algodón</option>
                    <option value="1">Seda</option>
                    <option value="2">Lino</option>
                  </select>
                </div>
              </div>

              <div className="col">
                <div className="mb-3">
                  <label htmlFor="cantidadKg" className="form-label">
                    Cantidad (en kg):
                  </label>
                  <input
                    type="number"
                    step="0.01" // Permitir decimales para kg
                    className="form-control"
                    id="cantidadKg"
                    value={cantidadKg}
                    onChange={(e) => setCantidadKg(e.target.value)}
                    placeholder="Ingrese la cantidad en kg"
                  />
                </div>
              </div>

              <div className="col">
                <div className="mb-3">
                  <label htmlFor="precioEth" className="form-label">
                    Precio (en ETH):
                  </label>
                  <input
                    type="number"
                    step="0.0001" // Permitir decimales para ETH
                    className="form-control"
                    id="precioEth"
                    value={precioEth}
                    onChange={(e) => setPrecioEth(e.target.value)}
                    placeholder="Ingrese el precio en ETH"
                  />
                </div>
              </div>
            </div>

            <div className="text-center">
              <button type="submit" className="btn btn-primary">
                Añadir Material
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DashboardAgr;
