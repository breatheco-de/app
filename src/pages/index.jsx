import { SliceZone } from '@prismicio/react';
import * as prismicH from '@prismicio/helpers';
import { Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';

import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { createClient } from '../../prismicio';
import { components } from '../../slices';
import { isWhiteLabelAcademy } from '../utils/variables';

const UID_OF_PAGE = 'home';

function Page({ page, whiteLabelHome }) {
  const router = useRouter();
  const prismicRef = process.env.PRISMIC_REF;
  const prismicApi = process.env.PRISMIC_API;
  const landingUrl = page?.data?.landing_url;

  useEffect(() => {
    if (whiteLabelHome) {
      router.replace(router.locale === 'es' ? '/es/login' : '/login');
      return;
    }
    if (landingUrl?.length > 0) {
      router.push(landingUrl);
    }
    if (!prismicRef && !prismicApi) {
      router.push('/login');
    }
    const userLang = navigator?.language || navigator?.userLanguage;
    const isSpanish = userLang?.startsWith('es');
    if (isSpanish && router.locale !== 'es') {
      router.push('/es');
    }
  }, []);

  return prismicRef && prismicApi && (
    <Box className="prismic-body" pt="1rem" px={{ base: '10px', md: '2rem' }}>
      <SliceZone slices={page?.data?.slices} components={components} />
    </Box>
  );
}

Page.propTypes = {
  page: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  whiteLabelHome: PropTypes.bool,
};

Page.defaultProps = {
  page: null,
  whiteLabelHome: false,
};
export default Page;

export async function getStaticProps({ locale, locales, previewData }) {
  if (isWhiteLabelAcademy) {
    return {
      props: {
        page: null,
        seo: {},
        whiteLabelHome: true,
      },
    };
  }

  const client = createClient({ previewData });
  const prismicRef = process.env.PRISMIC_REF;
  const prismicApi = process.env.PRISMIC_API;

  const languages = {
    en: 'en-us',
    es: 'es-es',
  };

  const page = await client?.getByUID('page', UID_OF_PAGE, { lang: languages[locale] })
    .then((response) => response)
    .catch(() => null);

  const isCurrenLang = page?.lang?.split('-')?.[0] === locale;

  if (!page || !isCurrenLang) {
    return {
      notFound: true,
    };
  }

  const { title, description, image, type } = page.data;

  return {
    props: {
      page,
      seo: prismicRef && prismicApi ? {
        title: title || '',
        description,
        image: prismicH.asImageSrc(image) || '',
        locales,
        locale,
        keywords: page?.tags || [],
        publishedTime: page?.first_publication_date || '',
        modifiedTime: page?.last_publication_date || '',
        type: type || null,
      } : {},
    },
  };
}
