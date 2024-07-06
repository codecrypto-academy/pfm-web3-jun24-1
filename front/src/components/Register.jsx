import { Typewriter } from 'react-simple-typewriter';
import { useForm } from '../hook/useForm';
import { ethers } from 'ethers';
import contractABI from '../../../artifacts/contracts/UserStorage.sol/UserStorage.json'; // Ajusta la ruta según donde tengas el archivo JSON
import { userStorageAddress } from '../../../contractsInfo.json';


export function Register() {
    const { address, name, role, password, onInputChange, onResetForm } = useForm({
        address: "",
        name: "",
        role: "",
        password: "",
    });

    const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545"); // Configura el proveedor para la red local de Hardhat
    const signer = provider.getSigner(); // Obtén el signer (cuenta) para enviar transacciones

    const userStorageContract = new ethers.Contract(userStorageAddress, contractABI.abi, signer);

    const onRegister = async (e) => {
        e.preventDefault();

        try {
            // Envía la transacción al contrato para registrar un usuario
            const tx = await userStorageContract.registerUser(
                address,
                name,
                role,
                password
            );

            // Espera a que la transacción se confirme
            await tx.wait();

            console.log("Usuario registrado en la blockchain");
            onResetForm();// Redirigir al dashboard después del registro
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
                                    ' agricultor',
                                    ' ganadero',
                                    ' comerciante',
                                    ' emprendedor',
                                    ' artesano',
                                    ' diseñador/a de moda',
                                    ' escritor',
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
