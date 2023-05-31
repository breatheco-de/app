import { SliceZone } from '@prismicio/react';
import * as prismicH from '@prismicio/helpers';
import { Box } from '@chakra-ui/react';
import PropTypes from 'prop-types';

import { createClient } from '../../prismicio';
import { components } from '../../slices';

const UID_OF_PAGE = 'home';

const Page = ({ page }) => (
  <Box className="prismic-body" pt="3rem">
    <SliceZone slices={page?.data?.slices} components={components} />
  </Box>
);

Page.propTypes = {
  page: PropTypes.objectOf(PropTypes.any).isRequired,
};
export default Page;

export async function getStaticProps({ locale, locales, previewData }) {
  const client = createClient({ previewData });

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

  const { title, description, image, type } = page?.data;

  return {
    props: {
      page,
      seo: {
        title: title || '',
        description,
        image: prismicH.asImageSrc(image) || '',
        locales,
        locale,
        keywords: page?.tags || [],
        publishedTime: page?.first_publication_date || '',
        modifiedTime: page?.last_publication_date || '',
        type: type || null,
      },
    },
  };
}
