
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Leaf } from "lucide-react";
import "../styles/navbar.css";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

function getSavedUser() {
  try {
    const token = localStorage.getItem("bb_token");
    const user = localStorage.getItem("bb_user");

    if (!token || !user) return null;

    return JSON.parse(user);
  } catch {
    return null;
  }
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(getSavedUser);
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    function updateAuth() {
      setUser(getSavedUser());
    }

    window.addEventListener("auth-change", updateAuth);
    window.addEventListener("storage", updateAuth);

    return () => {
      window.removeEventListener("auth-change", updateAuth);
      window.removeEventListener("storage", updateAuth);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("bb_token");
    localStorage.removeItem("bb_user");

    setUser(null);
    closeMenu();

    window.dispatchEvent(new Event("auth-change"));
    navigate("/", { replace: true });
  }

  return (
    <header className="site-header">
      <nav className="nav-shell container" aria-label="Main navigation">
        <Link className="brand" to="/" onClick={closeMenu}>
          <span className="brand-mark">
            <Leaf size={21} />
          </span>
          <span>
            Bite <em>&</em> Bloom
          </span>
        </Link>

        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>

        <div className={`nav-content ${menuOpen ? "is-open" : ""}`}>
          <div className="nav-links">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={closeMenu}
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="nav-actions">
            {user ? (
              <>
                <span className="nav-login">
                  Hi, {user.name || user.email || "there"}
                </span>

                <button
                  type="button"
                  className="button button-small"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  className="nav-login"
                  to="/login"
                  onClick={closeMenu}
                >
                  Log in
                </Link>

                <Link
                  className="button button-small"
                  to="/signup"
                  onClick={closeMenu}
                >
                  Join us
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
