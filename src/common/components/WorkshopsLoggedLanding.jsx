import useTranslation from 'next-translate/useTranslation';
import MktEventCards from './MktEventCards';
import MktSearchBar from './MktSearchBar';
import MktTechnologiesPills from './MktTechnologiesPills';
import MktTechnologies from './MktTechnologies';
import Heading from './Heading';

function WorkshopsLoggedLanding() {
  const { t } = useTranslation('workshops');

  return (
    <>
      <MktTechnologiesPills background="blue.50" paddingTop="50px" technologies={['MACHINE LEARNING', 'DATA SCIENCE', 'SOFTWARE ENGINEERING', 'CYBERSECURITY', '+MORE TECHNOLOGIES']} />
      <MktSearchBar
        headingTop={t('intro.top-title')}
        headingBottom={t('intro.lower-title')}
        subtitle={t('intro.subtitle')}
        background="blue.50"
        popularSearches={['Python', 'HTML', 'Pandas']}
        popularSearchesTitle={t('common:popular-searches')}
      />
      <MktEventCards margin="50px auto" searchSensitive />
      <MktEventCards margin="50px auto" title={t('upcoming-events')} />
      <MktEventCards margin="50px auto" title={t('events-joined')} showCheckedInEvents />
      <Heading textAlign="center" margin="40px 0">{t('search-your-fav-tech')}</Heading>
      <MktTechnologies />
      <MktEventCards margin="50px auto" techFilter="Javascript" />
      <MktEventCards margin="50px auto" techFilter="Python" />
    </>
  );
}

export default WorkshopsLoggedLanding;
