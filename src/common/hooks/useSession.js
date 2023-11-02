import { useContext } from 'react';
import { SessionContext } from '../context/SessionContext';

const useSession = () => useContext(SessionContext);

export default useSession;
