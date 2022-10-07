import { useContext } from 'react';
import { ConnectionContext } from '../context/ConnectionContext';

const useConnect = () => useContext(ConnectionContext);

export default useConnect;
