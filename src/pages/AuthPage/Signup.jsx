import { useNavigate } from "react-router-dom";
import { useState } from "react";

import MagicLoader from "../../components/MagicLoader/MagicLoader";
import "./Form.css";

const Signup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignupSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target);
    const userData = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'inscription");
      }
      navigate("/signin");
    } catch (error) {
      console.error("Erreur d'inscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && (
        <div className="alert-container">
          <p className="alert-message">
            Le Backend est hébergé sur un serveur gratuit.
          </p>
          <p className="alert-message">
            L'opération peut prendre quelques minutes
          </p>
        </div>
      )}
      <div className="form-container">
        <div className="form-card">
          <form onSubmit={handleSignupSubmit}>
            <div className="form-row">
              <input type="email" placeholder="Email" name="email" />
            </div>
            <div className="form-row">
              <input type="text" placeholder="Pseudo" name="username" />
              <input
                type="password"
                placeholder="Mot de passe"
                name="password"
              />
            </div>
            <div className="form-row">
              <button
                type="submit"
                className={`submit-button ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? <MagicLoader /> : "S'inscrire"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
export default Signup;
