import React from 'react';
import {
  Box, useMediaQuery,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import axios from '../../axios';
import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';
import Module from '../../common/components/Module';
import { usePersistent } from '../../common/hooks/usePersistent';

function CohortProgram({ item, handleChoose }) {
  const { t } = useTranslation('choose-program');
  const [isMobile] = useMediaQuery('(min-width: 600px)');
  const [, setCohortSession] = usePersistent('cohortSession', {});
  const router = useRouter();

  const { cohort } = item;
  const { version, slug, name } = cohort.syllabus_version;
  // const commonBorderColor = useColorModeValue('gray.200', 'gray.500');

  return (
    <Module
      containerPX="24px"
      data={{
        type: name,
        title: `Cohort: ${cohort.name}`,
      }}
      leftContentStyle={{
        maxWidth: !isMobile ? '135px' : 'auto',
      }}
      rightItemHandler={(
        <Box
          width="100%"
          onClick={() => {
            handleChoose({
              version,
              slug,
              cohort_name: cohort.name,
              cohort_slug: cohort?.slug,
              syllabus_name: name,
              academy_id: cohort.academy.id,
            });

            axios.defaults.headers.common.Academy = cohort.academy.id;
            setCohortSession({
              ...cohort,
              selectedProgramSlug: `/cohort/${cohort?.slug}/${slug}/v${version}`,
            });
            router.push(`/cohort/${cohort?.slug}/${slug}/v${version}`);
          }}
          display="flex"
          justifyContent="flex-end"
          _focus={{ boxShadow: 'none' }}
          cursor="pointer"
        >
          <Text
            size="l"
            margin="0px"
            width="max-content"
            color="blue.400"
            fontWeight="800"
            justifyContent="center"
            alignSelf="center"
            marginRight="15px"
          >
            {isMobile ? t('launch-program') : ''}
          </Text>
          <Icon
            color="#0097CD"
            icon="longArrowRight"
            width="22px"
            height="11"
            style={{ margin: 'auto 0' }}
          />
        </Box>
      )}
    />
  );
}

CohortProgram.propTypes = {
  item: PropTypes.objectOf(PropTypes.any),
  handleChoose: PropTypes.func,
};
CohortProgram.defaultProps = {
  item: {},
  handleChoose: () => {},
};

export default CohortProgram;
