import { Box, useColorModeValue } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import IntroductionSection from './IntroductionSection';
import MktEventCards from './PrismicComponents/MktEventCards';
import MktTechnologies from './PrismicComponents/MktTechnologies';
import MktTwoColumnSideImage from './PrismicComponents/MktTwoColumnSideImage';

function WorkshopsPublicLanding() {
  const { t } = useTranslation('workshops');
  const backgroundByMode = useColorModeValue('#F3FAFE', '#17202A');

  const hero = t('public-landing.hero', {}, { returnObjects: true });
  const sections = t('public-landing.sections', {}, { returnObjects: true });
  const startingSoonTitle = t('public-landing.starting-soon');

  const heroIsValid = hero && typeof hero === 'object' && !Array.isArray(hero);
  const sectionsList = Array.isArray(sections) ? sections : [];

  // Only pass media on slice — empty title arrays are truthy and break IntroductionSection.
  const heroSlice = {
    primary: {
      two_column_size: 'Both are equal',
      image: heroIsValid ? {
        url: hero.image,
        alt: hero.imageAlt || 'Introduction avatars',
        dimensions: { width: 400, height: 333 },
      } : undefined,
    },
  };

  const heroData = heroIsValid ? {
    title: hero.title,
    highlight: hero.highlight,
    description: hero.description,
    callToAction: {
      title: hero.buttonLabel,
      href: hero.buttonUrl || '/pricing?plan=basic',
    },
  } : {};

  return (
    <Box
      className="prismic-body"
      pt="1rem"
      px={{ base: '10px', md: '2rem' }}
      overflow="hidden"
      pb="5rem"
      background={backgroundByMode}
    >
      <IntroductionSection
        data={heroData}
        slice={heroSlice}
        margin="0 auto"
        gridGap="24px"
        maxWidth="1280px"
        fontFamily="Lato"
      />

      <MktTechnologies id="technologies" margin="80px auto 80px auto" />

      <MktEventCards title={startingSoonTitle} margin="50px auto" />

      {sectionsList.map((section) => {
        const description = Array.isArray(section.bullets) && section.bullets.length > 0
          ? section.bullets.map((item) => `• ${item}`).join('\n')
          : section.description;

        return (
          <MktTwoColumnSideImage
            key={section.title}
            title={section.title}
            subTitle={section.subtitle || null}
            description={description}
            imageUrl={section.image}
            imageAlt={section.imageAlt || section.title}
            imagePosition={section.imagePosition || 'right'}
            buttonUrl={section.buttonUrl || '/pricing?plan=basic'}
            buttonLabel={section.buttonLabel}
            linkButton={Boolean(section.linkButton)}
            buttonColor="Blue"
            fontFamily="Lato"
            margin="80px auto 80px auto"
            textSideProps={{
              sx: {
                whiteSpace: 'pre-line',
              },
            }}
          />
        );
      })}
    </Box>
  );
}

export default WorkshopsPublicLanding;
