import { useContext } from 'react';
import { ConnectionContext } from '../context/ConnectionContext';

const useOnline = () => useContext(ConnectionContext);

export default useOnline;
