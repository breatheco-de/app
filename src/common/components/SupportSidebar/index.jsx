import { useEffect, memo, useState } from 'react';
import {
  Box, Heading, Button, useColorMode, useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import Icon from '../Icon';
import Text from '../Text';
import bc from '../../services/breathecode';
import { usePersistent } from '../../hooks/usePersistent';
import Mentoring from './Mentoring';

// const isWindow = typeof window !== 'undefined';
// const cohortSession = isWindow ? JSON.parse(localStorage.getItem('cohortSession') || '{}') : {};
// const accessToken = isWindow ? localStorage.getItem('accessToken') : '';

// const academySlug = cohortSession && cohortSession.academy?.slug;

const SupportSidebar = ({
  title, subtitle, actionButtons, width,
}) => {
  const { colorMode } = useColorMode();
  const router = useRouter();
  const { slug } = router.query;
  const [programServices, setProgramServices] = usePersistent('programServices', []);
  const [openMentors, setOpenMentors] = useState(false);
  const [mentoryProps, setMentoryProps] = useState({});

  const [programMentors, setProgramMentors] = useState([]);
  // const fontColor = useColorModeValue('gray.600', 'gray.300');
  // const commonBorderColor = useColorModeValue('gray.200', 'gray.500');
  const commonBackground = useColorModeValue('white', 'rgba(255, 255, 255, 0.1)');

  useEffect(() => {
    bc.mentorship().getService().then(({ data }) => {
      if (data !== undefined && data.length > 0) {
        setProgramServices(data);
        const allMentorsArray = [];
        Promise.all(data.map(async (service) => {
          const mentors = await bc.mentorship({
            service: service.slug,
            status: 'ACTIVE',
            syllabus: slug,
          }).getMentor({ serviceSlug: service.slug });
          allMentorsArray.push(mentors.data);
        })).then(() => {
          // const mentorsArray = allMentorsArray.reduce((acc, curr) => acc.concat(curr), []);
          const mentorsArray = allMentorsArray.filter(
            (value, index, self) => index === self.findIndex(
              (c) => c.place === value.place && c.slug === value.slug,
            ),
          )[0];

          setProgramMentors(mentorsArray);
        });
      }
    }).catch((err) => {
      console.error('err_mentorship:', err);
    });
  }, []);

  return !openMentors ? (
    <Box
      backgroundColor={colorMode === 'light' ? 'yellow.light' : 'featuredDark'}
      width={width}
      height="auto"
      borderWidth="0px"
      borderRadius="lg"
      overflow="hidden"
    >
      <Box d="flex" justifyContent="center">
        <Icon icon="sideSupport" width="85px" height="50px" />
      </Box>
      <Box p="4" pb="30px" pt="20px">
        <Box d="flex" alignItems="baseline" justifyContent="center">
          <Heading fontSize="xsm" textAlign="center" justify="center" mt="0px" mb="0px">
            {title}
          </Heading>
        </Box>

        <Box d="flex" alignItems="baseline" justifyContent="center">
          <Text size="md" textAlign="center" mt="10px" px="0px">
            {subtitle}
          </Text>
        </Box>

        <Box pt="3" display="flex" flexDirection="column" alignItems="center">
          {actionButtons.filter((el) => el.name !== 'mentoring').map((button, i) => {
            const index = i;
            return (
              <a
                id={`support-action-${button.name}`}
                key={`${button.title}-${index}`}
                href={button.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ width: '100%' }}
              >
                <Button
                  size="lg"
                  gridGap="10px"
                  width="100%"
                  key={button.title}
                  bg={commonBackground}
                  _hover={{
                    background: `${colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.2)'}`,
                  }}
                  _active={{
                    background: `${colorMode === 'light' ? 'gray.light' : 'rgba(255, 255, 255, 0.22)'}`,
                  }}
                  borderWidth="0px"
                  padding="14px 20px"
                  my="8px"
                  borderRadius="8px"
                  justifyContent="space-between"
                >
                  <Icon icon={button.icon} width="25px" height="25px" />
                  <Text
                    display="flex"
                    whiteSpace="pre-wrap"
                    fontWeight="400"
                    textAlign="left"
                    textTransform="uppercase"
                    size="12px"
                    color={colorMode === 'light' ? 'black' : 'white'}
                  >
                    {button.title}
                  </Text>
                  <Icon icon="arrowRight" width="22px" height="22px" />
                </Button>
              </a>
            );
          })}

          {programServices
          && programServices.length > 0
          && actionButtons.filter((el) => el.name === 'mentoring').map((button) => (
            <Button
              size="lg"
              gridGap="10px"
              width="100%"
              onClick={() => setOpenMentors(!openMentors)}
              key={button.title}
              bg={commonBackground}
              _hover={{
                background: `${colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.2)'}`,
              }}
              _active={{
                background: `${colorMode === 'light' ? 'gray.light' : 'rgba(255, 255, 255, 0.22)'}`,
              }}
              borderWidth="0px"
              padding="14px 20px"
              my="8px"
              borderRadius="8px"
              justifyContent="space-between"
            >
              <Icon icon={button.icon} width="25px" height="25px" />
              <Text
                display="flex"
                whiteSpace="pre-wrap"
                fontWeight="400"
                textAlign="left"
                textTransform="uppercase"
                size="12px"
                color={colorMode === 'light' ? 'black' : 'white'}
              >
                {button.title}
              </Text>
              <Icon icon="arrowRight" width="22px" height="22px" />
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  ) : (
    <Mentoring
      programServices={programServices}
      setMentoryProps={setMentoryProps}
      mentoryProps={mentoryProps}
      programMentors={programMentors}
      setOpenMentors={setOpenMentors}
    />
  );
};

SupportSidebar.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  actionButtons: PropTypes.arrayOf(PropTypes.any),
  width: PropTypes.string,
};

SupportSidebar.defaultProps = {
  actionButtons: [],
  title: '',
  subtitle: '',
  width: '100%',
};

export default memo(SupportSidebar);
