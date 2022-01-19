import React from 'react';
import { Box, useMediaQuery, useColorMode } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import Icon from './Icon';
import Text from './Text';

function Choose({ chooseList, handleChoose }) {
  const [isMobile] = useMediaQuery('(min-width: 600px)');
  const { colorMode } = useColorMode();
  const router = useRouter();

  return (
    <>
      {chooseList.map((item) => {
        const cohort = item?.cohort;
        // Destructuring the cohort.syllabus_version object with version, slug, name
        const { version, slug, name } = cohort?.syllabus_version;
        return (
          <Box
            marginBottom="22px"
            display="flex"
            justifyContent="space-between"
            flexDirection="row"
            borderRadius="25px"
            height={['66px', '70px', '80px', '80px']}
            width={['70%', '68%', '56%', '50%']}
            border="lightgray solid 2px"
            fontSize={['11px', '13px', '14px', '15px', '15px']}
            key={item?.id || cohort.name}
          >
            <Box display="flex" flexDirection="column" marginLeft="25px">
              <Text
                size="sm"
                color={colorMode === 'light' ? 'gray.700' : 'white'}
                marginLeft="20px"
                fontWeight="900"
                margin="0px"
                marginTop="15px"
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
                  syllabus_name: name,
                  academy_id: cohort.academy.id,
                });
                if (typeof window !== 'undefined') localStorage.setItem('cohortSelected', `/cohort/${cohort?.slug}/${slug}/v${version}`);
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
                color={colorMode === 'light' ? '#0097CD' : '#FFFFFF'}
                icon="longArrowRight"
                width="22px"
                height="11"
                style={{ margin: 'auto' }}
              />
            </Box>
          </Box>
        );
      })}
    </>
  );
}

Choose.propTypes = {
  chooseList: PropTypes.arrayOf(PropTypes.object),
  handleChoose: PropTypes.func,
};
Choose.defaultProps = {
  chooseList: [],
  handleChoose: () => {},
};

export default Choose;
