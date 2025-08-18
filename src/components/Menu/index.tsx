import styles from "./styles.module.css"
import { Link, useNavigate } from "react-router-dom";
import AppContext from "../../AppContext";
import { useContext } from "react";

export default function Menu() {
    const { menuOpen, setMenuOpen, setCurrentUser, currentUser } = useContext(AppContext);
    const navigate = useNavigate();
    return (
        <div className={styles.menu + (menuOpen ? "" : " " + styles.closed)}>
            {menuOpen ? <div className={styles.innerMenu}>
                <div className={styles.header}>
                    <button className={styles.closeButton} onClick={() => setMenuOpen(false)}>X</button>
                    <button className={styles.profileButton} onClick={() => { setMenuOpen(false); navigate("/profissional/" + currentUser?.id) }}><img src={currentUser?.foto != "" ? currentUser?.foto : `${import.meta.env.BASE_URL}icons/avatar.svg`} alt="" style={{ width: "50px", borderRadius: "50%" }}></img></button>
                </div>
                <Link to={"/"} onClick={() => setMenuOpen(false)}>Disciplinas</Link>
                <Link to={"/profissionais"} onClick={() => setMenuOpen(false)}>Profissionais</Link>
                <Link to={"/indicadores"} onClick={() => setMenuOpen(false)}>Indicadores</Link>
                <Link className={styles.logout} to={"/login"} onClick={() => { setCurrentUser(undefined); localStorage.setItem("currentUser", JSON.stringify(undefined)); setMenuOpen(false) }}>Logout</Link>
            </div> : null}
        </div>
    );
}