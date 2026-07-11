import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { getAccessToken, getUserInfo } from "../../utils/TokenUtilities";
import useAuthentication from "../../hooks/useAuthentication";
import { usePWA } from "../hooks/usePWA";
import { useViewMode } from "../hooks/useViewMode";

const Header = () => {
    const { doLogout } = useAuthentication();
    const token = getAccessToken();
    const userInfo = getUserInfo();
    const { isInstallable, installPWA } = usePWA();
    const { isDesktop, toggleViewMode } = useViewMode();

    const onLogoutClick = () => {
        doLogout();
    };

    return (
        <Navbar bg="white" variant="light" expand="lg" className="sticky-top shadow-sm monarca-navbar">
            <Container>
                <Link className="navbar-brand font-weight-bold d-flex align-items-center gap-2" to={token ? (userInfo?.rol === 'ADMINISTRADOR' ? '/admin/pos' : '/mesero/pos') : '/menu'} style={{ color: 'var(--cafe-primary)' }}>
                    <span className="material-symbols-outlined brand-icon" style={{ color: '#D97706' }}>local_cafe</span>
                    <span style={{ fontWeight: 800, letterSpacing: '-0.5px' }}>Monarca</span>
                    <span style={{ fontWeight: 500, opacity: 0.75, fontSize: '0.9rem' }}>Coffee POS</span>
                </Link>

                <div className="d-flex align-items-center ms-auto gap-2">
                    {isInstallable && (
                        <button 
                            className="btn btn-primary d-flex align-items-center gap-1 btn-sm font-weight-bold rounded-pill px-3 py-1 heartbeat-btn" 
                            onClick={installPWA}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>install_mobile</span>
                            <span className="d-none d-sm-inline">Instalar</span>
                        </button>
                    )}
                    <Navbar.Toggle aria-controls="basic-navbar-nav" className="ms-2" />
                </div>

                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Link className="nav-link d-flex align-items-center gap-2" to="/menu">
                            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>restaurant_menu</span>
                            Menú
                        </Link>

                        {!token && (
                            <>
                                <Link className="nav-link d-flex align-items-center gap-2" to="/login">
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>login</span>
                                    Iniciar sesión
                                </Link>
                            </>
                        )}

                        {token && userInfo?.rol === 'ADMINISTRADOR' && (
                            <>
                                <Link className="nav-link font-weight-bold text-primary" to="/admin">
                                    <span className="material-symbols-outlined align-middle me-1" style={{ fontSize: '1.2rem' }}>dashboard</span>
                                    Dashboard
                                </Link>
                                <Link className="nav-link" to="/admin/pos">☕ POS Rápido</Link>
                                <Link className="nav-link" to="/admin/usuarios">Usuarios</Link>
                                <Link className="nav-link" to="/admin/productos">Inv. / Productos</Link>
                                <Link className="nav-link" to="/admin/categorias">Categorías</Link>
                                <Link className="nav-link" to="/admin/reportes">Reportes</Link>
                            </>
                        )}

                        {token && userInfo?.rol === 'MESERO' && (
                            <>
                                <Link className="nav-link d-flex align-items-center gap-2" to="/mesero/pos">
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>point_of_sale</span>
                                    POS Rápido
                                </Link>
                                <Link className="nav-link d-flex align-items-center gap-2" to="/mesero/mis-pedidos">
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>receipt_long</span>
                                    Mis Pedidos
                                </Link>
                            </>
                        )}
                    </Nav>

                    {token && (
                        <Nav>
                            <NavDropdown
                                title={
                                <span className="d-inline-flex align-items-center gap-2 font-weight-bold">
                                        <span className="material-symbols-outlined" style={{ color: 'var(--cafe-primary)' }}>account_circle</span>
                                        {userInfo?.persona ? `${userInfo.persona.nombre} ${userInfo.persona.apellido}` : userInfo?.username || "Usuario"}
                                    </span>
                                }
                                id="user-dropdown"
                                align="end"
                            >
                                <NavDropdown.Item disabled>
                                    <small className="text-muted-custom">Rol: {userInfo?.rol}</small>
                                </NavDropdown.Item>
                                <NavDropdown.Divider />
                                {/* Toggle Vista Móvil / Escritorio */}
                                <button
                                    className="dropdown-item d-flex align-items-center gap-2"
                                    onClick={toggleViewMode}
                                    id="toggle-view-mode-btn"
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>
                                        {isDesktop ? 'smartphone' : 'desktop_windows'}
                                    </span>
                                    {isDesktop ? 'Cambiar a Vista Móvil' : 'Cambiar a Vista Escritorio'}
                                    <span className={`ms-auto badge rounded-pill ${isDesktop ? 'bg-primary' : 'bg-secondary'}`} style={{ fontSize: '0.65rem' }}>
                                        {isDesktop ? 'ESCRITORIO' : 'MÓVIL'}
                                    </span>
                                </button>
                                <NavDropdown.Divider />
                                <button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={onLogoutClick}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>logout</span>
                                    Cerrar sesión
                                </button>
                            </NavDropdown>
                        </Nav>
                    )}
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;
