import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../../store/slices/userSlice";
import MagicLoader from "../../components/MagicLoader/MagicLoader";
import "./Form.css";

const Signin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSigninSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target);
    const userData = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la connection");
      }

      const data = await response.json();
      console.log(data);
      dispatch(
        setUser({
          username: data.username,
          token: data.token,
          userId: data.userId,
        })
      );
      sessionStorage.setItem(
        "userInfos",
        JSON.stringify({
          username: data.username,
          token: data.token,
          userId: data.userId,
        })
      );

      navigate("/");
    } catch (error) {
      console.error("Erreur de connection:", error);
    } finally {
      setIsLoading(false);
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
            <button
              type="submit"
              className={`submit-button ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? <MagicLoader /> : "Se connecter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signin;
