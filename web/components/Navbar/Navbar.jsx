import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

import axios from 'axios'

import './Navbar.css'

const Navbar = () => {

    const { user, logout } = useAuth();

    const logout_wrapper = async () => {

        try {
            await axios.post('http://localhost:8000/api/logout', user, { withCredentials: true });
            logout();
        }
        catch (error) {
            console.error('Error logging out', error);
        }
    }
        

    return (
        <div>
            <header className='top-grid'>
                <h1 className='tg-header'>Tiny Maps</h1>
                <div className='tg-contact'>+1 (800) MAPS </div>
            </header>
            <header className='bottom-grid'>
                <nav className='middle-tabs'>
                    <div className='hamburger-content'>
                        {(user) && (
                            <>
                                <Link to="/dashboard">Dashboard</Link>
                                <Link to="/about">About</Link>
                                <Link to="/contact">Contact Us</Link>
                                <Link to="/login" onClick={logout_wrapper}>Logout</Link>
                            </>
                        )}

                        {(!user) && (
                            <>
                                <Link to="/">Home</Link>
                                <Link to="/about">About</Link>
                                <Link to="/contact">Contact Us</Link>
                                <Link to="/login">Login</Link>
                                <Link to="/signup">Sign Up</Link>
                            </>
                        )}
                    </div>
                </nav>
            </header>
        </div>
    )
}

export default Navbar; 
