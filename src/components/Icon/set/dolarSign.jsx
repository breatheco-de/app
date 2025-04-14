/* eslint-disable react/prop-types */
import { useColorMode } from '@chakra-ui/react';

function DolarSign({
  width, height, style, fill, color,
}) {
  const { colorMode } = useColorMode();
  return (
    <svg
      width={width || '24'}
      height={height || '24'}
      viewBox="0 0 24 24"
      fill={fill || 'none'}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      stroke={color || (colorMode === 'light' ? '#3A3A3A' : '#FFFFFF')}
    >
      <path d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23Z" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9.5 14.5C9.5 14.9945 9.64662 15.4778 9.92133 15.8889C10.196 16.3 10.5865 16.6205 11.0433 16.8097C11.5001 16.9989 12.0028 17.0484 12.4877 16.952C12.9727 16.8555 13.4181 16.6174 13.7678 16.2678C14.1174 15.9181 14.3555 15.4727 14.452 14.9877C14.5484 14.5028 14.4989 14.0001 14.3097 13.5433C14.1205 13.0865 13.8 12.696 13.3889 12.4213C12.9778 12.1466 12.4945 12 12 12C11.5055 12 11.0222 11.8534 10.6111 11.5787C10.2 11.304 9.87952 10.9135 9.6903 10.4567C9.50108 9.9999 9.45157 9.49723 9.54804 9.01228C9.6445 8.52732 9.8826 8.08187 10.2322 7.73223C10.5819 7.3826 11.0273 7.1445 11.5123 7.04804C11.9972 6.95157 12.4999 7.00108 12.9567 7.1903C13.4135 7.37952 13.804 7.69995 14.0787 8.11108C14.3534 8.5222 14.5 9.00555 14.5 9.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 5.5V18.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>

  );
}

export default DolarSign;
