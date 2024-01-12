import { useNavigate } from 'react-router-dom'

import './Form.css';

const Signup = () => {
  const navigate = useNavigate();

  const handleSignupSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const userData = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'inscription');
      }
      navigate('/signin');

    } catch (error) {
      console.error('Erreur d\'inscription:', error);
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <form onSubmit={handleSignupSubmit}>
          <div className="form-row">
            <input type="email" placeholder="Email" name="email" />
          </div>
          <div className="form-row">
            <input type="text" placeholder="Pseudo" name="username" />
            <input type="password" placeholder="Mot de passe" name="password" />
          </div>
          <div className="form-row">
            <button type="submit">S&apos;inscrire</button>
          </div>
        </form>
      </div>
    </div>
  )
}
export default Signup