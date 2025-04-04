import useStyle from '../../hooks/useStyle';

export const getSlideProps = (open) => {
  const { borderColor } = useStyle();

  const config = {
    minWidth: '290px',
    zIndex: 1200,
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    flex: '1 0 auto',
    width: 'inherit',
    transform: open ? 'translateX(0rem)' : 'translateX(-30rem)',
    visibility: open ? 'visible' : 'hidden',
    outline: 0,
    borderRight: `1px solid ${borderColor}`,
    transition: open ? 'transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms' : 'box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    transitionProperty: open ? 'transform' : 'box-shadow',
    transitionDuration: open ? '225ms' : '300ms',
    transitionTimingFunction: open ? 'cubic-bezier(0, 0, 0.2, 1)' : 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDelay: open ? '0ms' : '0ms',
  };
  return config;
};
