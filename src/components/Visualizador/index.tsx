import { useContext } from 'react';
import AppContext from '../../AppContext';
import styles from './styles.module.css'
import { Topico } from '../../Interfaces';
import { Link } from 'react-router-dom';

export default function Visualizador({ tipo, title, subtitle, lista, reset }: { tipo: string, title: string, subtitle: string, lista: any[], reset: Function }) {
    const { Disciplinas } = useContext(AppContext);
    function agruparPorDisciplina<T extends { idDisciplina: number, numero?: number, topicoNum?: number }>(list: T[]) {
        let disciplinasAgrupadas: Record<number, number[]> = {};
        list.map((item) => {
            if (!disciplinasAgrupadas[item.idDisciplina]) {
                disciplinasAgrupadas[item.idDisciplina] = [];
            }
            disciplinasAgrupadas[item.idDisciplina].push(item.numero ?? item.topicoNum ?? 0);
        });
        return Object.entries(disciplinasAgrupadas).map(([id, topicos]) => {
            const disciplina = Disciplinas.find((disciplina) => disciplina.id.toString() == id);
            return {
                id: disciplina?.id,
                texto: disciplina?.nome + (disciplina?.up != "" ? " (UP)" : "") + " - " + (topicos.length == 1 ? "Tópico " + topicos[0] : "Tópicos " + topicos.join(", "))
            };
        });
    }
    return (
        tipo ?
            <div className={styles.bg}>
                <div className={styles.container}>
                    <button className={styles.closeBtn} onClick={() => { reset() }}>X</button>
                    <div className={styles.title}>
                        <h2>{title} - {lista.length}</h2>
                        <p>{subtitle ? `(${subtitle})` : null}</p>
                    </div>
                    <div className={styles.table}>
                        {tipo == "disciplina" ? lista.map((item, index) => (
                            <Link key={index} to={"/disciplina/" + item.id}>• {item.nome}</Link>
                        )) : null}
                        {tipo == "topico" ? agruparPorDisciplina(lista as Topico[]).map((item, index) => (
                            <Link key={index} to={"/disciplina/" + item.id}>• {item.texto}</Link>
                        )) : null}
                        {tipo == "video" ? agruparPorDisciplina(lista as Topico[]).map((item, index) => (
                            <Link key={index} to={"/disciplina/" + item.id}>• {item.texto}</Link>
                        )) : null}
                    </div>
                </div>
            </div>
            : null
    )
}