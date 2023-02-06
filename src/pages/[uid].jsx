import { SliceZone } from '@prismicio/react';
import * as prismicH from '@prismicio/helpers';
import PropTypes from 'prop-types';

import { createClient } from '../../prismicio';
import { components } from '../../slices';

const Page = ({ page }) => <SliceZone slices={page.data.slices} components={components} />;

Page.propTypes = {
  page: PropTypes.objectOf(PropTypes.any).isRequired,
};
export default Page;

export async function getStaticProps({ params, locale, previewData }) {
  const client = createClient({ previewData });
  const { uid } = params;

  const languages = {
    en: 'en-us',
    es: 'es-es',
  };

  const page = await client.getByUID('page', uid, { lang: languages[locale] });

  if (!page) {
    return {
      notFound: true,
    };
  }

  const { title, description, image, type } = page?.data;

  const translationsArr = page?.alternate_languages?.map((tr) => ({
    [tr.lang.split('-')[0]]: tr.uid,
  }));

  const translations = {
    ...translationsArr?.reduce((acc, curr) => ({ ...acc, ...curr }), {}),
  };

  const translationArray = [
    {
      value: 'us',
      lang: 'en',
      slug: translations?.en,
      link: `/${translations?.en}`,
    },
    {
      value: 'en',
      lang: 'en',
      slug: translations?.en,
      link: `/${translations?.en}`,
    },
    {
      value: 'es',
      lang: 'es',
      slug: translations?.es,
      link: `/es/${translations?.es}`,
    },
  ].filter((item) => translations?.[item?.value] !== undefined);

  const translationsExists = Object.keys(translations).length > 0;

  return {
    props: {
      page,
      seo: {
        title: title || '',
        description: description || '',
        image: prismicH.asImageSrc(image) || '',
        pathConnector: translationsExists ? '' : `/${uid}`,
        slug: uid,
        url: `/${uid}`,
        translations,
        locale,
        publishedTime: page?.first_publication_date || '',
        modifiedTime: page?.last_publication_date || '',
        type: type || null,
        keywords: page?.tags,
        // translations: page?.alternate_languages?.map((lang) => ({
        //   locale: lang.lang.split('-')[0],
        //   url: lang.url,
        // })),
      },
      translations: translationArray,
    },
  };
}

export async function getStaticPaths() {
  const client = createClient();

  const documents = await client.getAllByType('page', { lang: '*' });
  return {
    paths: documents.map((doc) => ({ params: { uid: doc.uid }, locale: doc.lang.split('-')[0] })),
    fallback: false,
  };
}
