import styles from "./styles.module.css";

export default function ConfirmPrompt({ text, confirmAction, setClosed }: { text: string, confirmAction: () => void, setClosed: (value: boolean) => void }) {
    return (
        <div className={styles.bg}>
            <div className={styles.container}>
                <h3>{text}</h3>
                <button className={styles.btnDel} onClick={() => { setClosed(true) }}>Cancelar</button>
                <button className={styles.btn} onClick={() => { confirmAction(); setClosed(true) }}>Confirmar</button>
            </div>
        </div>
    );
}