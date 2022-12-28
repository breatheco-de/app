import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';

function useLocalStorageQuery(queryKey, queryFn, options) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cachedData = JSON.parse(localStorage.getItem('queryCache'));

    if (cachedData && cachedData[queryKey]) {
      setData(cachedData[queryKey]);
      setIsLoading(false);
    }
  }, []);

  const queryResult = useQuery(
    queryKey,
    queryFn,
    {
      ...options,
      onSuccess: (dataFetched) => {
        setData(dataFetched?.data);
        setIsLoading(false);
        const cachedData = JSON.parse(localStorage.getItem('queryCache')) || {};
        cachedData[queryKey] = dataFetched?.data;
        localStorage.setItem('queryCache', JSON.stringify(cachedData));
      },
      onError: (errorFetched) => {
        setError(errorFetched);
        setIsLoading(false);
      },
    },
  );

  return {
    data: data || queryResult.data,
    isLoading: isLoading || queryResult.isLoading,
    error: error || queryResult.error,
  };
}

export default useLocalStorageQuery;
