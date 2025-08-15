import { useEffect, useState } from "react";
import { Disciplina, Profissional } from "../../Interfaces";
import { CardPessoa } from "../../components";
import styles from "./styles.module.css"

export default function ShowPessoal({ disciplina }: { disciplina: Disciplina }) {
    const [profissionais, setProfissionais] = useState<Profissional[]>([]);

    useEffect(() => {
        const novosProfissionais: Profissional[] = [];

        const adicionar = (prof: Profissional) => {
            if (!novosProfissionais.find(p => p.id === prof.id)) {
                novosProfissionais.push(prof);
            }
        };

        disciplina.orientadores.forEach(adicionar);

        disciplina.topicos.forEach(topico => {
            topico.conteudistas.forEach(adicionar);
            topico.validadores.forEach(adicionar);
            topico.videos.forEach(video => {
                video.apresentador.forEach(adicionar);
                video.convidado.forEach(adicionar);
            });
        });

        setProfissionais(novosProfissionais);
    }, [disciplina]);

    return (
        profissionais.length > 0 ? <div className={styles.pessoalTecnico}>
            <h3>Pessoal Técnico</h3>
            <div className={styles.profissionais}>
                {profissionais.map((profissional) => (
                    <CardPessoa key={profissional.id} pessoa={profissional} disciplina={disciplina} />
                ))}
            </div>
        </div>
            : <></>);
}
