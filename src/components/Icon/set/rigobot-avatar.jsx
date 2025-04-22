const rigotbotAvatar = ({ color, secondColor, width, height }) => (
  <svg width={width || '59px'} height={height || '38'} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 11.5C2.5 7.4 5.8 4 10 4h38.8c4.2 0 7.6 3.4 7.6 7.5v2.8c0 4.1-3.4 7.5-7.6 7.5H10a7.5 7.5 0 0 1-7.5-7.5v-2.8Z" fill={color || '#0097CF'} />
    <path fillRule="evenodd" clipRule="evenodd" d="M43.2 1.3c-.3-.5-1-.5-1.2 0l-2.8 5.2H13.4a4.8 4.8 0 0 0-4.8 4.9v20.8c0 2.7 2.1 4.9 4.8 4.9h32c2.7 0 4.8-2.2 4.8-4.9V11.4c0-2.6-1.8-4.6-4.2-4.9l-2.8-5.2Z" fill={secondColor || '#fff'} />
    <path fillRule="evenodd" clipRule="evenodd" d="M39.9 7.7H13.4c-2 0-3.6 1.6-3.6 3.7v20.8c0 2 1.6 3.7 3.6 3.7h32c2 0 3.6-1.7 3.6-3.7V11.4c0-2-1.4-3.5-3.2-3.7h-.6l-2.6-5-2.7 5Zm2-6.4c.3-.5 1-.5 1.3 0L46 6.5c2.4.3 4.2 2.3 4.2 4.9v20.8c0 2.7-2.1 4.9-4.8 4.9h-32a4.8 4.8 0 0 1-4.8-4.9V11.4c0-2.7 2.1-5 4.8-5h25.8L42 1.4Z" fill={color || '#0097CF'} />
    <path d="M50.2 13c0-.6.5-1 1-1h6.6c.6 0 1 .4 1 1v12.7c0 .5-.4 1-1 1h-6.6a1 1 0 0 1-1-1V13ZM0 13c0-.6.4-1 1-1h6.6c.5 0 1 .4 1 1v12.7c0 .5-.5 1-1 1H1a1 1 0 0 1-1-1V13Z" fill={color || '#0097CF'} />
    <path d="M6.1 11.5c0-1 .9-2 2-2h42.6c1.1 0 2 1 2 2v15.6c0 1.1-.9 2-2 2H8.1c-1.1 0-2-.9-2-2V11.5Z" fill={color || '#0097CF'} />
    <path fillRule="evenodd" clipRule="evenodd" d="M50.7 10.7H8.1c-.5 0-.8.3-.8.8v15.6c0 .5.3.9.8.9h42.6c.5 0 .8-.4.8-.9V11.5c0-.5-.3-.8-.8-.8ZM8.1 9.5c-1.1 0-2 1-2 2v15.6c0 1.1.9 2 2 2h42.6c1.1 0 2-.9 2-2V11.5c0-1-.9-2-2-2H8.1Z" fill={color || '#0097CF'} />
    <path d="M29 18.5c.1-.5.7-.5.8 0L33.1 29c0 .3-.2.6-.5.6h-6.4c-.3 0-.5-.3-.4-.6L29 18.5Z" fill={secondColor || '#fff'} />
    <path d="M15.3 13.2a1.2 1.2 0 0 1 2.4 0v11.7a1.2 1.2 0 0 1-2.4 0V13.2Z" fill="#F95A00" />
    <path d="M41 13.2c0-.7.6-1.2 1.3-1.2.6 0 1.2.5 1.2 1.2v11.7c0 .6-.6 1.2-1.2 1.2-.7 0-1.3-.6-1.3-1.2V13.2Z" fill={secondColor || '#fff'} />
  </svg>
);

export default rigotbotAvatar;
