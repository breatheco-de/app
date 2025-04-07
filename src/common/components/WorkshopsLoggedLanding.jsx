import useTranslation from 'next-translate/useTranslation';
import { useColorModeValue } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import MktEventCards from './MktEventCards';
import MktSearchBar from './MktSearchBar';
import MktTechnologiesPills from './MktTechnologiesPills';
import MktTechnologies from './MktTechnologies';
import Heading from './Heading';
import bc from '../services/breathecode';

function WorkshopsLoggedLanding() {
  const { t } = useTranslation('workshops');
  const [techs, setTechs] = useState([]);

  useEffect(() => {
    const fetchTechnologies = async () => {
      try {
        const res = await bc.lesson({ sort_priority: 1 }).techsBySort();
        const { data } = res;
        setTechs(data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchTechnologies();
  }, []);

  return (
    <>
      <MktTechnologiesPills background="blue.50" paddingTop="50px" technologies={['MACHINE LEARNING', 'DATA SCIENCE', 'SOFTWARE ENGINEERING', 'CYBERSECURITY', '+MORE TECHNOLOGIES']} />
      <MktSearchBar
        headingTop={t('intro.top-title')}
        headingBottom={t('intro.lower-title')}
        subtitle={t('intro.subtitle')}
        backgroundColor={useColorModeValue('blue.50')}
        popularSearches={['Python', 'HTML', 'Pandas']}
        popularSearchesTitle={t('common:popular-searches')}
      />
      <MktEventCards margin="50px auto" searchSensitive sortPrioOneTechs={techs} />
      <MktEventCards margin="50px auto" title={t('upcoming-events')} sortPrioOneTechs={techs} />
      <MktEventCards margin="50px auto" title={t('events-joined')} showCheckedInEvents sortPrioOneTechs={techs} />
      <Heading textAlign="center" margin="40px 0">{t('search-your-fav-tech')}</Heading>
      <MktTechnologies />
      <MktEventCards margin="50px auto" techFilter="Javascript" sortPrioOneTechs={techs} />
      <MktEventCards margin="50px auto" techFilter="Python" sortPrioOneTechs={techs} />
    </>
  );
}

export default WorkshopsLoggedLanding;
