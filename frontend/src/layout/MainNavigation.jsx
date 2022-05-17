import { Link } from "react-router-dom";
import { Fragment, useContext } from "react";
import { handleLogout } from "../components/helpers/api-calls";
import AuthContext from "../components/auth/auth-context";

const MainNavigation = () => {
    const { user, setUser } = useContext(AuthContext);

    const handleLogoutClick = () => {
        handleLogout();
        setUser(null);
    };

    return (
        <nav className="flex items-center justify-between flex-wrap bg-sky-700 p-6">
            <div className="flex items-center flex-shrink-0 text-white mr-6">
                <span className="font-semibold text-2xl tracking-tight">
                    <a href="/all">Doubtful-Joy SE</a>
                </span>
            </div>
            {user && (
                <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
                    <div className="text-sm lg:flex-grow">
                        <a
                            href="/all"
                            className="block mt-4 lg:inline-block lg:mt-0 text-sky-200 hover:text-white mr-4"
                        >
                            Alle Tickets
                        </a>
                        <a
                            href="/new"
                            className="block mt-4 lg:inline-block lg:mt-0 text-sky-200 hover:text-white mr-4"
                        >
                            Neues Ticket
                        </a>
                    </div>

                    <div>
                        <a
                            href="/"
                            onClick={handleLogoutClick}
                            className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-sky-500 hover:bg-white mt-4 lg:mt-0"
                        >
                            Logout
                        </a>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default MainNavigation;
