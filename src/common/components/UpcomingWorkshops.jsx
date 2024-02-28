import { Tag, TagLabel } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import useTranslation from 'next-translate/useTranslation';
import axios from '../../axios';
import SmallCardsCarousel from './SmallCardsCarousel';
import modifyEnv from '../../../modifyEnv';

const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });

const langsDict = {
  es: 'es',
  en: 'en',
  us: 'en',
};

function UpcomingWorkshops() {
  const [cards, setCards] = useState([]);
  const { t } = useTranslation('workshops');

  const endpointDefault = '/v1/events/all';

  const isLive = (start, end) => {
    const ended = end - new Date() <= 0;
    if (ended) return false;

    return start - new Date() <= 0;
  };

  useEffect(() => {
    axios.get(`${BREATHECODE_HOST}${endpointDefault}`)
      .then((res) => {
        const data = res?.data;
        if (data && data.length > 0) {
          const formatedData = data.map((event) => {
            const startDate = new Date(event.starting_at);
            const endDate = new Date(event.ending_at);
            return {
              ...event,
              title: event.title,
              upperTags: event.asset?.technologies || [],
              url: `/workshops/${event.slug}`,
              lang: langsDict[event.lang || 'en'],
              lowerTags: [t('common:workshop')],
              rightCornerElement: isLive(startDate, endDate) ? (
                <Tag
                  size="sm"
                  borderRadius="full"
                  variant="solid"
                  colorScheme="green"
                  width="fit-content"
                  background="red.light"
                  minWidth="fit-content"
                >
                  <TagLabel
                    fontWeight="700"
                    color="danger"
                  >
                    {`• ${t('live-event:live-now')}`}
                  </TagLabel>
                </Tag>
              ) : format(startDate, 'dd-MM-yyyy').replaceAll('-', '/'),
            };
          });
          setCards(formatedData);
        }
      });
  }, []);

  return (
    <SmallCardsCarousel
      title={t('common:upcoming-workshops')}
      cards={cards}
    />
  );
}

export default UpcomingWorkshops;
