import useTranslation from 'next-translate/useTranslation';
import MktEventCards from './MktEventCards';
import MktSearchBar from './MktSearchBar';
import MktTechnologiesPills from './MktTechnologiesPills';
import MktTechnologies from './MktTechnologies';

function WorkshopsLoggedLanding() {
  const { t } = useTranslation('workshops');

  return (
    <>
      <MktTechnologiesPills background="blue.50" paddingTop="50px" technologies={['MACHINE LEARNING', 'DATA SCIENCE', 'SOFTWARE ENGINEERING', 'CYBERSECURITY', '+MORE TECHNOLOGIES']} />
      <MktSearchBar headingTop={t('intro.top-title')} headingBottom={t('intro.lower-title')} subtitle={t('intro.subtitle')} background="blue.50" technologies={['Python', 'HTML', 'Pandas']} />
      <MktEventCards margin="10px auto" title={t('upcoming-events')} />
      <MktEventCards margin="10px auto" title={t('upcoming-events')} />
      <MktTechnologies />
      <MktEventCards margin="10px auto" title={t('upcoming-events')} />
      <MktEventCards margin="10px auto" title={t('upcoming-events')} />
    </>
  );
}

export default WorkshopsLoggedLanding;
