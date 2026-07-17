import useAuth from '../../hooks/useAuth';
import WorkshopsLoggedLanding from '../../components/WorkshopsLoggedLanding';
import WorkshopsPublicLanding from '../../components/WorkshopsPublicLanding';
import LoaderScreen from '../../components/LoaderScreen';

export const getStaticProps = async ({ locale, locales }) => {
  const seoByLocale = {
    en: {
      title: 'Workshops',
      description: 'Join other coders live solving technical or career challenges. Workshops are one of the 4 proven pillars to mastery when learning technical skills, learn more.',
    },
    es: {
      title: 'Workshops',
      description: 'Únete a otros programadores en vivo resolviendo desafíos técnicos o profesionales. Los workshops son uno de los 4 pilares comprobados para dominar habilidades técnicas.',
    },
  };

  const seoContent = seoByLocale[locale] || seoByLocale.en;
  const image = 'https://images.prismic.io/4geeks/1b22d0f7-e60c-46b5-a69a-21d54e4a68f3_Frame+38.png?auto=compress,format';

  return {
    props: {
      seo: {
        title: seoContent.title,
        description: seoContent.description,
        image,
        pathConnector: '/workshops',
        url: '/workshops',
        locales,
        locale,
        translations: [
          { value: 'en', lang: 'en', slug: 'workshops', link: '/workshops' },
          { value: 'es', lang: 'es', slug: 'workshops', link: '/es/workshops' },
        ],
      },
    },
  };
};

function WorkshopsPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoaderScreen />;
  }

  if (isAuthenticated) {
    return <WorkshopsLoggedLanding />;
  }

  return <WorkshopsPublicLanding />;
}

export default WorkshopsPage;
