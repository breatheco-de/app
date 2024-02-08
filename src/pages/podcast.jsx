import { useEffect, useRef, useState } from 'react';

export const getStaticProps = () => ({
  props: {
    seo: {
      title: 'Podcast',
      description: 'A tech-culture podcast where you learn to fight the enemies to become a successful professional in tech.',
    },
  },
});

const podcastPage = () => {
  const ref = useRef(null);
  const [height, setHeight] = useState(0);

  const onLoad = () => {
    setHeight(ref.current.contentWindow.window.parent.outerHeight + 8);
  };
  useEffect(() => {
    onLoad();
  }, []);

  return (
    <iframe
      ref={ref}
      id="iframe"
      src="https://podcast.4geeks.com/"
      width="100%"
      height={height > 0 ? `${height}px` : '100vh'}
      frameBorder="0"
      title="Podcast"
    />
  );
};

export default podcastPage;
