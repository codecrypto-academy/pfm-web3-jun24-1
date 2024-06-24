import "../index.css";
import { Typewriter } from "react-simple-typewriter";
import { useForm } from '../hook/useForm';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export function Register() {
    const navigate = useNavigate();
    const { account, address, name, role, password, onInputChange, onResetForm } = useForm({
        account: '',
        address: '',
        name: '',
        role: '',
        password: '',
    });

    const onRegister = async (e) => {
        e.preventDefault();

        const userData = {
            account: address,
            username: name,
            role: role,
            password: password
        };

        try {
            await axios.post('http://localhost:3000/register', userData);
            console.log('Usuario registrado en la blockchain');
            onResetForm();
            navigate('/dashboard'); // Redirigir al dashboard después del registro
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
                                    " agricultor",
                                    " ganadero",
                                    " comerciante",
                                    " emprendedor",
                                    " artesano",
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
                    <p className="fixed-text">Compra y vende fácilmente con un solo click <br /> Sin intermediarios</p>
                </div>
            </div>
            <div className="form-container">
                <div className="container">
                    <form onSubmit={onRegister}>
                        <h1>Regístrate</h1>
                        <div className="input-box">
                            <input type="text" placeholder="address" name='address' id='address' value={address} onChange={onInputChange} autoComplete="off" required />
                        </div>
                        <div className="input-box">
                            <input type="text" placeholder="username" name='name' id='name' value={name} onChange={onInputChange} autoComplete="off" required />
                        </div>
                        <div className="input-box">
                            <input type="text" placeholder="rol de usuario" name='role' id='role' value={role} onChange={onInputChange} autoComplete="off" required />
                        </div>
                        <div className="input-box">
                            <input type="password" placeholder="password" name='password' id='password' value={password} onChange={onInputChange} autoComplete="off" required />
                        </div>
                        <button type="submit" className="btn">
                            Registrarse
                        </button>
                        <div className="register-link">
                            <p>
                                ¿Ya tienes una cuenta? <a href="/">Inicia sesión aquí</a>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}