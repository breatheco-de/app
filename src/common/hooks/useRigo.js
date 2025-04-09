import { useContext } from 'react';
import { RigoContext } from '../../context/RigoContext';

const useRigo = () => useContext(RigoContext);

export default useRigo;
