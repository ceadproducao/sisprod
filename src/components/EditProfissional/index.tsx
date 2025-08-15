import { useContext, useState } from "react";
import Cropper from "../Cropper";
import styles from "./styles.module.css";
import { Profissional } from "../../Interfaces";
import AppContext from "../../AppContext";

interface Props {
    closeAction: Function;
    profissional: Profissional;
}

export default function EditProfissional({ closeAction, profissional }: Props) {
    const [nome, setNome] = useState(profissional.nome);
    const [email, setEmail] = useState(profissional.email);
    const [tel, setTel] = useState(profissional.telefone);
    const [intExt, setIntExt] = useState(profissional.internoExterno || "Interno");
    const [treinamentos, setTreinamentos] = useState(profissional.treinamentos || "");

    const [foto, setFoto] = useState<File>();
    const [fotoCrop, setFotoCrop] = useState<File>();
    const [openCropper, setOpenCropper] = useState(false);
    const [fotoAcao, setFotoAcao] = useState<"manter" | "alterar" | "remover">("manter");

    const [startedSave, setStartedSave] = useState(false);
    const {currentUser} = useContext(AppContext);

    function editarProfissional() {
        setStartedSave(true);

        function fileToBase64(file: File): Promise<string | null> {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    if (typeof reader.result === "string") {
                        const base64String = reader.result.split(",")[1];
                        resolve(base64String);
                    } else {
                        reject(new Error("FileReader result is not uma string"));
                    }
                };
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(file);
            });
        }

        const enviarDados = (base64Foto: string | null) => {
            const body = {
                acao: "editarProfissional",
                id: profissional.id,
                nome,
                email,
                tel,
                intExt,
                treinamentos,
                fotoBase64: fotoAcao === "alterar" ? base64Foto : null,
                fotoNome: fotoAcao === "alterar" && foto ? foto.name : null,
                fotoTipo: fotoAcao === "alterar" && foto ? foto.type : null,
                removerFoto: fotoAcao === "remover",
            };

            console.log(JSON.stringify(body));

            fetch("https://script.google.com/macros/s/AKfycbyqzSfSRHYC6NgH9d_FkQCF_2_Br6nSjNwZ_0J4hUm1io4lTj-7a0t0YmlJ43KtgzbS/exec", {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain;charset=utf-8",
                },
                body: JSON.stringify(body),
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log(data);
                    closeAction();
                    setStartedSave(false);
                })
                .catch((err) => {
                    console.error(err);
                    setStartedSave(false);
                });
        };

        if (fotoAcao === "alterar" && foto) {
            fileToBase64(foto)
                .then((base64) => enviarDados(base64))
                .catch((err) => {
                    console.error("Erro ao converter foto:", err);
                    setStartedSave(false);
                });
        } else {
            enviarDados(null);
        }
    }

    return (
        <div className={styles.bg}>
            {openCropper && fotoCrop ? (
                <Cropper file={fotoCrop} setFoto={setFoto} setOpenCropper={setOpenCropper} />
            ) : null}
            <form className={styles.formAddProf}>
                {startedSave ? (
                    <h3>Salvando alterações...</h3>
                ) : (
                    <>
                        <button
                            className={styles.btn}
                            style={{ position: "absolute", top: 10, right: 10 }}
                            onClick={(e) => {
                                e.preventDefault();
                                closeAction();
                            }}
                        >
                            X
                        </button>
                        <h3>Editar Profissional</h3>

                        <div className={styles.formDiv}>
                            <label htmlFor="nomeProf">Nome: </label>
                            <input type="text" id="nomeProf" value={nome} onChange={(e) => setNome(e.target.value)} />
                        </div>

                        <div className={styles.formDiv}>
                            <label htmlFor="emailProf">Email: </label>
                            <input type="text" id="emailProf" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>

                        <div className={styles.formDiv}>
                            <label htmlFor="telProf">Tel: </label>
                            <input type="text" id="telProf" value={tel} onChange={(e) => setTel(e.target.value)} />
                        </div>

                        <div className={styles.formDiv}>
                            <label>Foto:</label>
                            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                <label>
                                    <input
                                        type="radio"
                                        name="fotoAcao"
                                        value="manter"
                                        checked={fotoAcao === "manter"}
                                        onChange={() => setFotoAcao("manter")}
                                    />
                                    Manter Foto Atual
                                </label>

                                <label>
                                    <input
                                        type="radio"
                                        name="fotoAcao"
                                        value="alterar"
                                        checked={fotoAcao === "alterar"}
                                        onChange={() => setFotoAcao("alterar")}
                                    />
                                    Alterar Foto
                                </label>

                                {fotoAcao === "alterar" && (
                                    <input
                                        type="file"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                setFotoCrop(e.target.files[0]);
                                                setOpenCropper(true);
                                            }
                                        }}
                                    />
                                )}

                                <label>
                                    <input
                                        type="radio"
                                        name="fotoAcao"
                                        value="remover"
                                        checked={fotoAcao === "remover"}
                                        onChange={() => setFotoAcao("remover")}
                                    />
                                    Remover Foto
                                </label>
                            </div>
                        </div>

                        {currentUser?.admin && <><div className={styles.formDiv}>
                            <label htmlFor="intExtProf">Int/Ext: </label>
                            <select id="intExtProf" value={intExt} onChange={(e) => setIntExt(e.target.value as "Interno" | "Externo")}>
                                <option value="Interno">Interno</option>
                                <option value="Externo">Externo</option>
                            </select>
                        </div>

                            <div className={styles.formDiv}>
                                <p><strong>Treinamentos:</strong></p>
                                <div className={styles.treinamentos}>
                                    {["Conteudista", "Vídeo", "Validador"].map((item) => (
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
                                                            : prev.split(";\n").filter((t) => t !== item).join(";\n")
                                                    )
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div></>}

                        <button
                            className={styles.btn}
                            onClick={(e) => {
                                e.preventDefault();
                                editarProfissional();
                            }}
                        >
                            Salvar Alterações
                        </button>
                    </>
                )}
            </form>
        </div >
    );
}
