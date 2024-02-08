import { Box } from '@chakra-ui/react';

const podcastPage = () => (
  <Box height="100vh">
    <iframe
      id="podcast"
      src="https://podcast.4geeks.com/"
      width="100%"
      height="100%"
      frameBorder="0"
      title="Podcast"
    />
  </Box>
);

export default podcastPage;
