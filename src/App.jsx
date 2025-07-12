import { useState } from "react";
import CleanerPanel from "./components/CleanerPanel";
import LoginForm from "./components/LoginForm";
import "./App.css";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (cleanerData) => {
    setCurrentUser(cleanerData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Cleaning Tasks!!</h1>
        {isLoggedIn && (
          <div className="user-info">
            <span>Welcome, {currentUser?.name}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        )}
      </header>

      <main className="app-main">
        {!isLoggedIn ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <CleanerPanel currentUser={currentUser} />
        )}
      </main>
    </div>
  );
}

export default App;
