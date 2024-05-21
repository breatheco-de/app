import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

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

  const queryResult = useQuery({
    queryKey,
    queryFn,
    ...options,
  });
  const { data: dataFetched, isSuccess, isError } = queryResult;

  useEffect(() => {
    if (isSuccess) {
      setData(dataFetched?.data);
      setIsLoading(false);
      const cachedData = JSON.parse(localStorage.getItem('queryCache')) || {};
      cachedData[queryKey] = dataFetched?.data;
      localStorage.setItem('queryCache', JSON.stringify(cachedData));
    }
    if (isError) {
      setError('Error fetching data for: ', queryKey);
      setIsLoading(false);
    }
  }, [isSuccess, isError]);
  return {
    data: data || dataFetched,
    isLoading: isLoading || queryResult.isLoading,
    error: error || queryResult.error,
    refetch: queryResult?.refetch,
  };
}

export default useLocalStorageQuery;
