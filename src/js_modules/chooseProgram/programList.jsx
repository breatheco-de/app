import React from 'react';
import {
  Box, useMediaQuery,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import axios from '../../axios';
import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';
import Module from '../../common/components/Module';

function CohortProgram({ item, handleChoose }) {
  const [isMobile] = useMediaQuery('(min-width: 600px)');
  // const { colorMode } = useColorMode();
  const router = useRouter();

  const cohort = item?.cohort;
  // Destructuring the cohort.syllabus_version object with version, slug, name
  const { version, slug, name } = cohort?.syllabus_version;
  // const commonBorderColor = useColorModeValue('gray.200', 'gray.500');

  return (
    <Module
      containerPX="24px"
      data={{
        type: name,
        title: `Cohort: ${cohort.name}`,
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
            if (typeof window !== 'undefined') {
              localStorage.setItem('cohortSession', JSON.stringify({
                ...cohort,
                selectedProgramSlug: `/cohort/${cohort?.slug}/${slug}/v${version}`,
              }));
            }
            router.push(`/cohort/${cohort?.slug}/${slug}/v${version}`);
          }}
          // marginRight="15px"
          display="flex"
          justifyContent="flex-end"
          _focus={{ boxShadow: 'none' }}
          cursor="pointer"
        >
          <Text
            size="l"
            margin="0px"
            color="blue.400"
            fontWeight="800"
            justifyContent="center"
            alignSelf="center"
            marginRight="15px"
          >
            {isMobile ? 'Launch this program' : ''}
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
