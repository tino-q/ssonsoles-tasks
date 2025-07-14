import { useLoading } from '../context/LoadingContext';
import { useTranslation } from 'react-i18next';

export const useApiRequest = () => {
  const { showLoading, hideLoading } = useLoading();
  const { t } = useTranslation();

  const executeRequest = async (requestFunction, loadingKey = 'loading.default') => {
    try {
      showLoading(t(loadingKey));
      const result = await requestFunction();
      return result;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    } finally {
      hideLoading();
    }
  };

  return { executeRequest };
};