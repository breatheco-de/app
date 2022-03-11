import React from 'react';
import {
  Box, useMediaQuery, useColorMode, useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import axios from '../../axios';
import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';

function CohortProgram({ item, handleChoose }) {
  const [isMobile] = useMediaQuery('(min-width: 600px)');
  const { colorMode } = useColorMode();
  const router = useRouter();

  const cohort = item?.cohort;
  // Destructuring the cohort.syllabus_version object with version, slug, name
  const { version, slug, name } = cohort?.syllabus_version;
  const commonBorderColor = useColorModeValue('gray.200', 'gray.500');

  return (
    <Box
      marginBottom="22px"
      display="flex"
      justifyContent="space-between"
      flexDirection="row"
      borderRadius="25px"
      height="100%"
      padding="22px 12px 22px 22px"
      width={['70%', '68%', '70%', '50%']}
      border={2}
      borderStyle="solid"
      borderColor={commonBorderColor}
      fontSize={['11px', '13px', '14px', '15px', '15px']}
      key={item?.id || cohort.name}
    >
      <Box display="flex" flexDirection="column">
        <Text
          size="sm"
          color={colorMode === 'light' ? 'gray.700' : 'white'}
          marginLeft="20px"
          fontWeight="900"
          margin="0px"
          textTransform="uppercase"
        >
          {name}
        </Text>
        <Text
          size="l"
          color={colorMode === 'light' ? 'gray.700' : 'white'}
          marginLeft="20px"
          marginRight="30px"
          margin="0px"
        >
          Cohort:
          {' '}
          {cohort.name}
        </Text>
      </Box>
      <Box
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
        marginRight="15px"
        display="flex"
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
          style={{ margin: 'auto' }}
        />
      </Box>
    </Box>
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
