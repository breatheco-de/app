import React, { memo, useEffect, useState, CSSProperties, SVGProps, FC, ComponentType } from 'react';
import dynamic from 'next/dynamic';
import { Box } from '@chakra-ui/react';
import iconDict from '../../../iconDict.json';

interface DynamicSvgProps extends SVGProps<SVGSVGElement> {
  secondColor?: string;
  full?: boolean;
  text?: string;
  color?: string;
  fill?: string;
}

interface IconProps {
  icon: string;
  width?: string | number;
  size?: string | number;
  height?: string | number;
  style?: CSSProperties;
  color?: string;
  secondColor?: string;
  fill?: string;
  className?: string;
  props?: SVGProps<SVGSVGElement>;
  full?: boolean;
  text?: string;
  [key: string]: any;
}

const Icon: FC<IconProps> = ({
  icon,
  width = '',
  size = '',
  height = '',
  style = {},
  color = '',
  secondColor = '',
  fill = '',
  className = '',
  props = {},
  full = false,
  text = '',
  ...rest
}) => {
  const [isMounted, setIsMounted] = useState<boolean>(false);

  if (typeof window === 'undefined') {
     return null;
  }

  const iconExists = (iconDict as string[]).includes(icon);

  const Comp = dynamic<DynamicSvgProps>(() => import(`./set/${iconExists ? icon : 'info'}`), { ssr: false });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const finalWidth = size || width;
  const finalHeight = size || height;

  return (
    <Box as="span" id={`icon-${icon}`} className={className} {...rest}>
      <Comp
        width={finalWidth}
        height={finalHeight}
        style={{
          ...style,
          minWidth: finalWidth,
          height: finalHeight,
        }}
        color={color}
        secondColor={secondColor}
        fill={fill}
        full={full}
        text={text}
        {...props}
      />
    </Box>
  );
}

export default memo(Icon); 