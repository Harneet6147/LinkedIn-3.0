import { Link } from "react-router-dom";
export const Navbar = () => {
    return (
        <nav className="navbar bg-dark" data-bs-theme="dark" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "50px" }}>
            <Link to="/home" > <button className="btn btn-dark">Home </button> </Link >
            <Link to="/connections">  <button className="btn btn-dark"> Connections</button> </Link>
            <Link to="/pending"> <button className="btn btn-dark">Pending Connections </button> </Link>
            <Link to="/dashBoard"><button className="btn btn-dark">DashBoard </button>  </Link>
            <Link to="/connectWallet"> <button className="btn btn-dark" >Register   </button> </Link>
        </nav >
    )
}