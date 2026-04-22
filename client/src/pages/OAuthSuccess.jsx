import { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const OAuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setToken, setUser } = useContext(AuthContext);

    useEffect(() => {
        const token = searchParams.get('token');
        const userData = searchParams.get('user');

        if (token && userData) {
            try {
                const user = JSON.parse(decodeURIComponent(userData));
                localStorage.setItem('token', token);
                setToken(token);
                setUser(user);
                navigate('/');
            } catch (err) {
                console.error('Failed to parse user data', err);
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate, setToken, setUser]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-fuchsia-50/50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-700">Signing you in...</h2>
            </div>
        </div>
    );
};

export default OAuthSuccess;
