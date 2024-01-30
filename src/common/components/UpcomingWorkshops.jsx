import {
  Box,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import axios from '../../axios';
import Heading from './Heading';
import Text from './Text';
import useStyle from '../hooks/useStyle';
import Icon from './Icon';
import TagCapsule from './TagCapsule';
import Link from './NextChakraLink';
import DraggableContainer from './DraggableContainer';
import modifyEnv from '../../../modifyEnv';

const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });

const langsDict = {
  es: 'es',
  en: 'en',
  us: 'en',
};

function UpcomingWorkshops({ technologies }) {
  const [events, setEvents] = useState([]);
  const { t } = useTranslation('workshops');
  const { hexColor } = useStyle();

  const endpointDefault = '/v1/events/all';

  useEffect(() => {
    axios.get(`${BREATHECODE_HOST}${endpointDefault}`)
      .then((res) => {
        const data = res?.data;
        if (data && data.length > 0) {
          setEvents(data);
        }
      });
  }, []);

  if (events.length === 0) return null;

  return (
    <Box mt="20px" mb="31px">
      <Heading size="m" fontWeight={700} mb="20px !important">
        {t('common:upcoming-workshops')}
      </Heading>
      <DraggableContainer>
        <Box gap="16px" display="flex">
          {events.map((event) => (
            <Box
              width="350px"
              border="1px solid"
              borderColor={hexColor.borderColor}
              borderRadius="10px"
              padding="16px"
              flexShrink="0"
              // cursor="pointer"
              minHeight="135px"
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
            >
              <Box alignItems="center" display="flex" justifyContent="space-between" marginBottom="10px">
                <TagCapsule
                  padding="0"
                  margin="0"
                  gap="10px"
                  tags={technologies?.slice(0, 3) || []}
                  variant="rounded"
                  width="100%"
                />
                <Text margin="0 !important" width="100%" fontWeight="400" color={hexColor.fontColor2} lineHeight="18px" textAlign="right">
                  {format(new Date(event.starting_at), 'dd-MM-yyyy').replaceAll('-', '/')}
                </Text>
              </Box>
              <Link marginBottom="10px" color={hexColor.black} href={`/${langsDict[event.lang || 'en']}/workshop/${event.slug}`}>
                <Box display="flex" alignItems="center" gap="5px" justifyContent="space-between">
                  <Text color={hexColor.black} size="md" fontWeight="700">
                    {event.title}
                  </Text>
                  <Icon icon="arrowRight" color={hexColor.black} width="20px" height="14px" />
                </Box>
              </Link>
              <Box width="80px" background="green.light" padding="5px 7px 5px 7px" borderRadius="27px">
                <Text color={hexColor.green} fontWeight="900" margin="0 !important" textAlign="center">
                  {t('common:workshop')}
                </Text>
              </Box>
            </Box>
          ))}
        </Box>
      </DraggableContainer>
    </Box>
  );
}

UpcomingWorkshops.propTypes = {
  technologies: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
};
UpcomingWorkshops.defaultProps = {
  technologies: [],
};

export default UpcomingWorkshops;
