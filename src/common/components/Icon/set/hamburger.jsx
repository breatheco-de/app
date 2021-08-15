import { useColorMode } from '@chakra-ui/react';

const hamburger = ({ width, height, style, color }) => {
    const { colorMode } = useColorMode();
    return <svg
    style={style}
    width={width || '20px'}
    height={height || '19px'} 
    aria-hidden="true" 
    focusable="false" 
    data-prefix="fas" 
    data-icon="bars" 
    className="svg-inline--fa fa-bars fa-w-14" 
    role="img" 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 448 512">
        <path fill={colorMode === 'light' ? color || '#0097CF' : '#FFFFFF'} d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"></path>
    </svg>;
}

export default hamburger;