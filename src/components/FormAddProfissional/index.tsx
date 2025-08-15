import { useState, useEffect } from "react";
import Cropper from "../Cropper";
import styles from "./styles.module.css"
import { Profissional } from "../../Interfaces";

export default function FormAddProfissional({ closeAction }: { closeAction: Function }) {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [tel, setTel] = useState("");
    const [foto, setFoto] = useState<File>();
    const [intExt, setIntExt] = useState("Interno");
    const [treinamentos, setTreinamentos] = useState("");
    const [startedAdd, setStartedAdd] = useState(false);
    const [openCropper, setOpenCropper] = useState(false);
    const [fotoCrop, setFotoCrop] = useState<File>();
    const [temAcesso, setTemAcesso] = useState(false);
    const [admin, setAdmin] = useState(false);
    function addProfissional() {
        setStartedAdd(true);

        function fileToBase64(file: File): Promise<string | null> {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = () => {
                    if (typeof reader.result === "string") {
                        const base64String = reader.result.split(',')[1];
                        resolve(base64String);
                    } else {
                        reject(new Error("FileReader result is not a string"));
                    }
                };

                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(file);
            });
        }

        const enviarDados = (base64Foto: string | null) => {
            const body = {
                acao: "adicionarProfissional",
                nome,
                email,
                tel,
                intExt,
                treinamentos,
                fotoBase64: base64Foto,
                fotoNome: foto ? foto.name : null,
                fotoTipo: foto ? foto.type : null,
                temAcesso,
                admin
            };

            console.log(JSON.stringify(body));

            fetch("https://script.google.com/macros/s/AKfycbyqzSfSRHYC6NgH9d_FkQCF_2_Br6nSjNwZ_0J4hUm1io4lTj-7a0t0YmlJ43KtgzbS/exec", {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain;charset=utf-8"
                },
                body: JSON.stringify(body),
            })
                .then(res => res.json())
                .then(data => {
                    console.log(data);
                    const novoProfissional: Profissional = {
                        id: parseInt(data.id),
                        nome,
                        email,
                        telefone: tel,
                        internoExterno: intExt as "Interno" | "Externo",
                        treinamentos,
                        foto: data.fotoUrl || "", // ou "" se não tiver URL vinda do backend
                        temAcesso,
                        admin
                    };
                    closeAction(novoProfissional);
                    setStartedAdd(false);
                })
                .catch(err => {
                    console.error(err);
                    setStartedAdd(false);
                });
        };

        if (foto) {
            fileToBase64(foto)
                .then(base64 => enviarDados(base64))
                .catch(err => {
                    console.error("Erro ao converter foto para base64:", err);
                    setStartedAdd(false);
                });
        } else {
            enviarDados(null);
        }
    }

    useEffect(() => { console.log(treinamentos) }, [treinamentos])
    return (
        <div className={styles.bg}>
            {openCropper && fotoCrop ? <Cropper file={fotoCrop} setFoto={setFoto} setOpenCropper={setOpenCropper}></Cropper> : null}
            <form className={styles.formAddProf}>
                {startedAdd ? <h3>Adicionando novo profissional...</h3> :
                    <>
                        <button className={styles.btn} style={{ position: "absolute", top: 10, right: 10 }} onClick={() => { closeAction(); }}>X</button>
                        <h3>Adicionar Profissional</h3>
                        <div className={styles.formDiv}>
                            <label htmlFor="nomeProf">Nome: </label>
                            <input type="text" id="nomeProf" name="nomeProf" value={nome} onChange={(e) => setNome(e.target.value)} />
                        </div>
                        <div className={styles.formDiv}>
                            <label htmlFor="emailProf">Email: </label>
                            <input type="text" id="emailProf" name="emailProf" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className={styles.formDiv}>
                            <label htmlFor="telProf">Tel: </label>
                            <input type="text" id="telProf" name="telProf" value={tel} onChange={(e) => setTel(e.target.value)} />
                        </div>
                        <div className={styles.formDiv}>
                            <label htmlFor="fotoProf">Foto: </label>
                            <input type="file" id="fotoProf" name="fotoProf" onChange={(e) => { setFotoCrop(e.target.files ? e.target.files[0] : undefined); setOpenCropper(true); }} />
                        </div>
                        <div className={styles.formDiv}>
                            <label htmlFor="intExtProf">Int/Ext: </label>
                            <select name="intExtProf" id="intExtProf" value={intExt} onChange={(e) => setIntExt(e.target.value)}>
                                <option value="Interno">Interno</option>
                                <option value="Externo">Externo</option>
                            </select>
                        </div>
                        <div className={styles.formDiv}>
                            <p><strong>Treinamentos: </strong></p>
                            <div className={styles.treinamentos}>
                                {[
                                    "Conteudista",
                                    "Vídeo",
                                    "Validador"
                                ].map((item) => (
                                    <div key={item}>
                                        <p>{item}:</p>
                                        <input
                                            type="checkbox"
                                            className={styles.check}
                                            checked={treinamentos.includes(item)}
                                            onChange={(e) =>
                                                setTreinamentos((prev) =>
                                                    e.target.checked
                                                        ? [...new Set([...prev.split(";\n").filter(Boolean), item])].join(";\n")
                                                        : prev
                                                            .split(";\n")
                                                            .filter((t) => t !== item)
                                                            .join(";\n")
                                                )
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.formDiv}>
                            <div style={{ textAlign: "center" }}>
                                <label htmlFor="permitirAcesso">Permitir Acesso: </label>
                                <input
                                    type="checkbox"
                                    id="permitirAcesso"
                                    className={styles.check}
                                    checked={temAcesso}
                                    onChange={(e) => setTemAcesso(e.target.checked)
                                    }
                                />
                                <label htmlFor="admin">Admin: </label>
                                <input
                                    type="checkbox"
                                    id="admin"
                                    className={styles.check}
                                    checked={admin}
                                    onChange={(e) => setAdmin(e.target.checked)
                                    }
                                />
                            </div>
                        </div>
                        <button className={styles.btn} onClick={() => addProfissional()}>Salvar Novo Profissional</button>
                    </>
                }
            </form>
        </div>)
}