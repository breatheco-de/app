/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import useAuth from '../../../../common/hooks/useAuth';
import bc from '../../../../common/services/breathecode';
import MarkDownParser from '../../../../common/components/MarkDownParser';
import getMarkDownContent from '../../../../common/components/MarkDownParser/markdown';
import GridContainer from '../../../../common/components/GridContainer';
import asPrivate from '../../../../common/context/PrivateRouteWrapper';

function Docs() {
  const router = useRouter();
  const { lang } = useTranslation();
  const [syllabusData, setSyllabusData] = useState(null);
  const { user, isLoading } = useAuth();
  const { syllabusSlug, assetSlug } = router.query;

  const academyId = user?.active_cohort?.academy_id;

  const getSyllabusData = async () => {
    try {
      const result = await bc.syllabus().get(academyId, syllabusSlug);
      setSyllabusData(result.data);
      console.log('syllabus version');
      console.log(result.data);

      const responseAsset = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${assetSlug}`);
      const assetData = await responseAsset.json();
      console.log('assetData');
      console.log(assetData);
    } catch (e) {
      console.log(e);
    }
  };

  const getAssetData = async () => {
    try {
      const response = await fetch(`${process.env.BREATHECODE_HOST}/v1/registry/asset/${assetSlug}`);
      const assetData = await response.json();
      console.log('assetData');
      console.log(assetData);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getSyllabusData();
  }, []);

  useEffect(() => {
    getAssetData();
  }, [assetSlug]);

  return (
    <>
      <GridContainer
        maxWidth="1440px"
        margin="28px auto 0 auto"
        height="100%"
        gridTemplateColumns="4fr repeat(12, 1fr)"
        gridGap="36px"
        padding="0 10px"
      >
        <Box>
          <h1>hey man</h1>
        </Box>
      </GridContainer>
    </>
  );
}

export default asPrivate(Docs);
