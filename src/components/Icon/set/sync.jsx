const sync = ({
  width, height, style, color,
}) => (
  <svg
    style={style}
    width={width || '18px'}
    height={height || '18px'}
    viewBox="0 0 18 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M1 5.81152L3.0123 8.80875L5.32032 6.03541" stroke={color || '#0097CF'} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17.2783 8.91714L15.2732 5.91992L12.958 8.69326" stroke={color || '#0097CF'} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15.2445 5.94922C15.4855 7.49687 15.1364 9.07875 14.2666 10.3806C13.3967 11.6824 12.0697 12.6092 10.5491 12.9766C9.53761 13.2156 8.48202 13.1931 7.48152 12.9114C6.48101 12.6296 5.56845 12.0978 4.82959 11.3659" stroke={color || '#0097CF'} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.01233 8.79491C2.80815 7.97437 2.76844 7.1213 2.89545 6.28529C3.02246 5.44928 3.31371 4.64676 3.75234 3.92414C4.19096 3.20152 4.76825 2.57323 5.45088 2.07539C6.13351 1.57754 6.90795 1.22013 7.72937 1.02379C8.80831 0.768599 9.93618 0.811112 10.9929 1.14686C12.0496 1.48262 12.9956 2.09896 13.7302 2.93038" stroke={color || '#0097CF'} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default sync;
