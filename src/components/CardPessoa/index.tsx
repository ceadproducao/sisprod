import { Disciplina, Profissional } from "../../Interfaces";
import { useEffect, useState } from "react";
import styles from "./styles.module.css"
import { Link } from "react-router-dom";

export default function CardPessoa({ pessoa, disciplina }: { pessoa: Profissional, disciplina?: Disciplina }) {
    const [funcoes, setFuncoes] = useState("");
    if (disciplina) {
        useEffect(() => {
            const funcoesTemp: Set<string> = new Set();
            disciplina.orientadores.forEach(x => {
                if (x.nome == pessoa.nome) {
                    funcoesTemp.add("Orientador(a) de Conteúdo");
                }
            });
            disciplina.topicos.forEach(x => {
                if (x.conteudistas.includes(pessoa)) {
                    funcoesTemp.add("Conteudista");
                }
                if (x.validadores.includes(pessoa)) {
                    funcoesTemp.add("Validador(a)");
                }
                x.videos.forEach(y => {
                    if (y.apresentador.includes(pessoa)) {
                        if (y.tipo == "Videocast") {
                            funcoesTemp.add("Entrevistador(a) de VideoCast");
                        } else {
                            funcoesTemp.add("Apresentador(a) de Video");
                        }
                    }
                    if (y.convidado.includes(pessoa)) {
                        funcoesTemp.add("Convidado(a) de VideoCast");
                    }
                });
            });

            setFuncoes(Array.from(funcoesTemp).join(", "));
        }, [disciplina, pessoa]);
    }
    return (
        <Link to={`/profissional/${pessoa.id}`} className={styles.card}>
            <img src={pessoa.foto != "" ? pessoa.foto : `${import.meta.env.BASE_URL}icons/avatar.svg`} alt="" />
            <h3>{pessoa.nome}</h3>
            {disciplina ? <p><strong>Funções: </strong> {funcoes}</p> : <p><strong>Email: </strong>{pessoa.email}</p>}
        </Link>
    );
}
