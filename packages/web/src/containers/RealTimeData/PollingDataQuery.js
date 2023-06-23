import { useEffect } from 'react';
import { useQuery } from 'react-query';

export const PollingDataQuery = ({ queryName, apiMethod, onSuccess, queryOptions = { refetchInterval: 60000 } }) => {
  const { data } = useQuery(queryName, apiMethod, queryOptions);

  useEffect(() => {
    if (data?.status === 'Success') {
      onSuccess(data);
    }  
  }, [data]);

  return null;
}
