import { useLoading } from '../context/LoadingContext';

const GlobalSpinner = () => {
  const { isLoading, loadingMessage } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="global-spinner-overlay">
      <div className="global-spinner-container">
        <div className="global-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <div className="spinner-message">{loadingMessage}</div>
      </div>
    </div>
  );
};

export default GlobalSpinner;