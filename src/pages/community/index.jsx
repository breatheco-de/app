import React from 'react';
import { Container } from '@chakra-ui/react';
import getT from 'next-translate/getT';
import CommunityPage from '../../components/CommunityPage';

export const getStaticProps = async ({ locale }) => {
  const t = await getT(locale, 'communities');
  const keywords = t('seo.keywords', {}, { returnObjects: true });

  return {
    props: {
      seo: {
        title: t('seo.title'),
        description: t('seo.description'),
        keywords,
        locale,
        url: `/${locale}/community`,
        pathConnector: '/community',
      },
    },
  };
};

function CommunityView() {
  return (
    <Container maxWidth="1280px" marginTop="20px" marginBottom="40px" padding={{ base: '10px', md: '20px' }}>
      <CommunityPage />
    </Container>
  );
}

CommunityView.propTypes = {};

CommunityView.defaultProps = {};

export default CommunityView;
