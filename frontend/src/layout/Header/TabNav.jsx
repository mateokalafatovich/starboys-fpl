import { NavLink } from "react-router-dom";

export default function TabNav() {
    return (
        <nav className="tab-nav">
            <div>
                <ul className="nav-links">
                    <li>
                        <NavLink to="/gameweek" className={({ isActive }) => isActive ? "active" : ""}>
                            Gameweek
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/weekly" className={({ isActive }) => isActive ? "active" : ""}>
                            Weekly
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/seasonal" className={({ isActive }) => isActive ? "active" : ""}>
                            Seasonal
                        </NavLink>
                    </li>
                </ul>
            </div>
        </nav>
    );
}
