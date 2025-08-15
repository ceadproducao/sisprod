import { useContext, useState } from 'react';
import styles from './styles.module.css'
import logo from '/logo.svg'
import AppContext from '../../AppContext';
import { useNavigate } from 'react-router-dom';

export default function ChangePasswordScreen() {
    const { currentUser, primeiroAcesso, setPrimeiroAcesso } = useContext(AppContext);
    const [senhaAtual, setSenhaAtual] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmaNovaSenha, setConfirmaNovaSenha] = useState("");
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div className={styles.centerer}>
            {!isLoading ?
                <form className={styles.container}>
                    <img className={styles.logo} src={logo} alt="Produção UVV On" />
                    {primeiroAcesso ? <p>Como este é seu primeiro acesso, precisamos que defina sua senha:</p> : <div className={styles.formDiv} style={{ marginTop: 30 }}>
                        <label htmlFor="currentPassword">Senha atual:</label>
                        <input type="password" id='currentPassword' className={styles.input} value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} />
                    </div>}
                    <div className={styles.formDiv}>
                        <label htmlFor="newPassword">Nova senha:</label>
                        <input type="password" id='newPassword' className={styles.input} value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} />
                    </div>
                    <div className={styles.formDiv}>
                        <label htmlFor="confirmNewPassword">Confirmar nova senha:</label>
                        <input type="password" id='confirmNewPassword' className={styles.input} value={confirmaNovaSenha} onChange={(e) => setConfirmaNovaSenha(e.target.value)} />
                    </div>
                    <button className={styles.btn} type='button' onClick={() => {
                        setIsLoading(true);
                        const body = {
                            acao: "alterarSenha",
                            id: currentUser?.id,
                            senhaAtual: senhaAtual == "" ? "Senha@123" : senhaAtual,
                            novaSenha: novaSenha,
                            confirmaNovaSenha: confirmaNovaSenha
                        };
                        fetch("https://script.google.com/macros/s/AKfycbyqzSfSRHYC6NgH9d_FkQCF_2_Br6nSjNwZ_0J4hUm1io4lTj-7a0t0YmlJ43KtgzbS/exec", {
                            method: "POST",
                            headers: {
                                "Content-Type": "text/plain;charset=utf-8"
                            },
                            body: JSON.stringify(body),
                        }).then(res => res.text())
                            .then((data) => {
                                console.log(data);
                                const resposta = JSON.parse(data);
                                if (resposta.sucesso === true) {
                                    setIsLoading(false);
                                    setPrimeiroAcesso(false);
                                    navigate('/');
                                } else {
                                    alert(resposta.mensagem);
                                }
                            })
                            .catch(err => {
                                console.error(err);
                            });
                    }}>Alterar senha</button>
                    <button type='button' className={styles.btnDel} onClick={() => navigate("/")}>Cancelar</button>
                </form> : <h2>Carregando...</h2>}
        </div>
    );
}