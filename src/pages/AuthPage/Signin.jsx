import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom'

import { userAtom } from '../../atoms/userAtom';
import './Form.css';

const Signin = () => {
  const navigate = useNavigate();
  const [, setUser] = useAtom(userAtom);

  const handleSigninSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const userData = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la connection');
      }

      const data = await response.json();
      console.log(data);
      setUser({
        isLoggedIn: true,
        username: data.username,
        token: data.token,
        userId: data.userId,
      });
      localStorage.setItem('userInfos', JSON.stringify({ username: data.username, token: data.token, userId: data.userId }));
      navigate('/');

    } catch (error) {
      console.error('Erreur de connection:', error);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <form onSubmit={handleSigninSubmit}>
          <div className="form-row">
            <input type="text" placeholder="Pseudo" name="username" />
            <input type="password" placeholder="Mot de passe" name="password" />
          </div>
          <div className="form-row">
            <button type="submit">Se connecter</button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default Signin