import { useContext, useState } from "react"
import styles from "./styles.module.css"
import logo from '/logo.svg'
import AppContext from "../../AppContext";
import { useNavigate } from 'react-router-dom';

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [loginStarted, setLoginStarted] = useState(false);
    const { Profissionais, setCurrentUser, setPrimeiroAcesso } = useContext(AppContext);
    const [manterConectado, setManterConectado] = useState(false);
    const navigate = useNavigate();
    function handleLogin() {
        setLoginStarted(true);
        const body = {
            acao: "login",
            email: email,
            senha: senha
        };

        fetch("https://script.google.com/macros/s/AKfycbyqzSfSRHYC6NgH9d_FkQCF_2_Br6nSjNwZ_0J4hUm1io4lTj-7a0t0YmlJ43KtgzbS/exec", {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(body),
        })
            .then(res => res.text())
            .then((data) => {
                console.log(data);
                const resposta = JSON.parse(data);
                if (resposta.sucesso === true) {
                    setCurrentUser(Profissionais.find(x => x.email == email));
                    if (manterConectado) {
                        localStorage.setItem("currentUser", JSON.stringify(Profissionais.find(x => x.email == email)));
                    }
                    if (resposta.primeiroAcesso) {
                        setPrimeiroAcesso(true);
                        navigate('/editarsenha')
                    } else {
                        navigate('/');
                    }
                } else {
                    setCurrentUser(undefined);
                    localStorage.setItem("currentUser", JSON.stringify(undefined));
                    alert(resposta.mensagem);
                }
            })
            .catch(err => {
                console.error(err);
            });
    }
    return (
        Profissionais.length > 0 && !loginStarted ?
            (<div className={styles.centerer}>
                <form action="" className={styles.container}>
                    <img className={styles.logo} src={logo} alt="Produção UVV On" />
                    <input type="email" placeholder="Email" className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input type="password" placeholder="Senha" className={styles.input} value={senha} onChange={(e) => setSenha(e.target.value)} />
                    <label>Manter conectado: <input type="checkbox" checked={manterConectado} onChange={(e) => setManterConectado(e.target.checked)} /></label>
                    <button className={styles.btn} onClick={(e) => {
                        e.preventDefault();
                        handleLogin();
                    }}>Entrar</button>
                </form>
            </div>) :
            (<div className={styles.centerer}>
                <h3>Carregando...</h3>
            </div>)
    )
}