import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState("");

    useEffect(() => {
        const loadUserToken = async () => {
            try {
                const response = await axios.post('http://localhost:8000/api/refresh', {}, { withCredentials: true });
                console.log(response);
                setUser(response.data.user);
                setAccessToken(response.data.accessToken);
            }
            catch (error) {
                console.error('Error with making axios post', error);
            }
        } 
        loadUserToken();
    }, [])


    const login = (user_data, accessToken) => {
        setUser(user_data);
        setAccessToken(accessToken);
    }

    const logout = () => {
        setUser(null);
        setAccessToken("");
    }

    return (
        <AuthContext.Provider value={{ user, accessToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);