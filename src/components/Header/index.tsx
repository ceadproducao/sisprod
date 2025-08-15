import styles from "./style.module.css";
import logo from "/logo.svg"
import { Link } from "react-router-dom";
import AppContext from "../../AppContext";
import { useContext } from "react";


export default function Header({ back }: { back?: string }) {
    const { setMenuOpen } = useContext(AppContext);
    return (
        <>
            <header className={styles.header}>
                {back ? <Link to={back} className={styles.btn}><img src="/icons/arrow.png" alt="" /></Link> : ""}
                <img className={styles.logo} src={logo} alt="Produção UVV On" />
                <button className={styles.btn + " " + styles.btnMenu} onClick={() => setMenuOpen(true)}><img src="/icons/menu.svg" alt="menu" /></button>
            </header>
            <div style={{ marginBottom: 100 }}>

            </div>
        </>
    );
}