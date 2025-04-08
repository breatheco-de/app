import { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import Heading from '../common/components/Heading';
import { BREATHECODE_HOST } from '../utils/variables';

export const getStaticProps = () => ({
  props: {
    previewMode: true,
    seo: {
      unlisted: true,
    },
  },
});

export default function Thmbnail() {
  const [asset, setAsset] = useState(null);
  const router = useRouter();
  const { slug } = router.query;

  const getAsset = async () => {
    const response = await fetch(`${BREATHECODE_HOST}/v1/registry/asset/${slug}`);
    const result = await response.json();

    setAsset(result);
  };

  useEffect(() => {
    if (slug !== undefined) {
      getAsset();
    }
  }, [slug]);

  const randomImgNumber = Math.floor(Math.random() * 10) + 1;
  const whiteColor = [1, 3, 5, 10];

  if (!asset) return null;

  return (
    <Box
      background={`url("/static/images/thumbnail/${randomImgNumber}.png")`}
      backgroundRepeat="no-repeat"
      backgroundSize="cover"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      color={whiteColor.includes(randomImgNumber) ? 'white' : 'black'}
    >
      <Heading
        type="h1"
        margin="0"
        lineHeight="1.15"
        fontSize="4rem"
        textAlign="center"
      >
        {asset.title}
      </Heading>
    </Box>
  );
}
