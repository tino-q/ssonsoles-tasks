import { useState } from "react";
import { useTranslation } from 'react-i18next';
import api from "../services/api";
import { useApiRequest } from "../hooks/useApiRequest";

function LoginForm({ onLogin }) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const { executeRequest } = useApiRequest();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await executeRequest(
        () => api.getCleaners(),
        "loading.credentials"
      );

      // Check if the response is successful and data is an array
      if (response.success && Array.isArray(response.data)) {
        const cleaners = response.data;
        const cleaner = cleaners.find((c) => c.phone === phone && c.active);

        if (cleaner) {
          onLogin(cleaner);
        } else {
          setError(t('login.error.notFound'));
        }
      } else {
        // Handle error response or invalid data
        console.error("Invalid cleaners response:", response);
        setError(response.data?.error || t('login.error.loadCleaners'));
      }
    } catch (error) {
      setError(t('login.error.failed'));
      console.error("Login error:", error);
    }
  };

  return (
    <div className="login-form">
      <h2>{t('login.title')}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="phone">{t('login.phone')}</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+34612345678"
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={!phone}>
          {t('login.button')}
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
