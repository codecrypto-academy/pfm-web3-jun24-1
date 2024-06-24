import { useState } from "react";

export function DashboardAgr() {
  const [selectedRow, setSelectedRow] = useState(null);
  console.log("Agricultor");

  const handleRowSelection = (index) => {
    setSelectedRow(index);
  };

  return (
    <div className="bg-dash">
      <div className="bg-dark rounded p-5 text-white m-5" id="productos">
        <h1 className="title-dashboard mb-3">PRODUCTOS</h1>
        <div className="">
          <table className="table table-striped table-dark table-bordered">
            <thead>
              <tr>
                <th scope="col">Select</th>
                <th scope="col">Token</th>
                <th scope="col">Nombre</th>
                <th scope="col">Total</th>
                <th scope="col">Unidad</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="m-3">
                  <input
                    type="checkbox"
                    checked={selectedRow === 1}
                    onChange={() => handleRowSelection(1)}
                  />
                </td>
                <td>Mark</td>
                <td>Otto</td>
                <td>@mdo</td>
                <td>@mdo</td>
                <td>@mdo</td>
              </tr>
              <tr>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRow === 2}
                    onChange={() => handleRowSelection(2)}
                  />
                </td>
                <td>Jacob</td>
                <td>Thornton</td>
                <td>@fat</td>
                <td>@mdo</td>
                <td>@mdo</td>
              </tr>
              <tr>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRow === 3}
                    onChange={() => handleRowSelection(3)}
                  />
                </td>
                <td>Larry</td>
                <td>the Bird</td>
                <td>@twitter</td>
                <td>@mdo</td>
                <td>@mdo</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>



      
      <div className="bg-dark rounded p-5 text-white m-5" id="mint">
        <h1 className="title-dashboard mb-3">MINT</h1>
        <form>
          <div className="row">
            <div className="col">
              <div className="mb-3">
                <label for="nombreProducto" className="form-label">
                  Nombre del producto:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="nombreProducto"
                  placeholder="Ingrese el nombre del producto"
                />
              </div>
            </div>

            <div className="col">
              <div className="mb-3">
                <label for="cantidad" className="form-label">
                  Cantidad:
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="cantidad"
                  placeholder="Ingrese la cantidad"
                />
              </div>
            </div>

            <div className="col">
              <div className="mb-3">
                <label for="unidad" className="form-label">
                  Seleccione unidad:
                </label>
                <select className="form-select" id="unidad">
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                  <option value="l">l</option>
                </select>
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
                  <label for="exampleLabel" className="form-label">Seleccione un token a transferir:</label>
                </div>
                <button type="button" className="btn btn-primary">Transferir</button>
              </div>
      </div>



      
    </div>
  );
}
