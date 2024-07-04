import { Typewriter } from 'react-simple-typewriter';
import { useForm } from '../hook/useForm';
import { ethers } from 'ethers';
import contractABI from '../../../artifacts/contracts/UserStorage.sol/UserStorage.json';

const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";


export function Register() {
    const { address, name, role, password, onInputChange, onResetForm } = useForm({
        address: "",
        name: "",
        role: "",
        password: "",
    });

    //Proveedor
    const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545"); 
    //Obtenemos la cuenta
    const signer = provider.getSigner(); 

    //Instancia del contrato
    const userStorageContract = new ethers.Contract(contractAddress, contractABI.abi, signer);

    const onRegister = async (e) => {
        e.preventDefault();

        try {
            // Envia la transaccion al contrato para registrar un usuario
            const tx = await userStorageContract.registerUser(
                address,
                name,
                role,
                password
            );

            // Se espera a que la transacción se confirme
            await tx.wait();

            console.log("Usuario registrado en la blockchain");
            //Reset del formulario
            onResetForm();
        } catch (error) {
            console.error("Error al registrar usuario:", error);
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
                                textAlign="left"
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
                    <form onSubmit={onRegister}>
                        <h1>Regístrate</h1>
                        <div className="input-box">
                            <input
                                type="text"
                                placeholder="address"
                                name="address"
                                id="address"
                                value={address}
                                onChange={onInputChange}
                                autoComplete="off"
                                required
                            />
                        </div>
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
                                type="text"
                                placeholder="rol de usuario"
                                name="role"
                                id="role"
                                value={role}
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
                                Registrarse
                            </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
