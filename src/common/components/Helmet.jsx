/* eslint-disable react/no-danger */
import React from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';

const Helmet = ({
  title, description, translations, url, image, card, type, twitterUser,
  unlisted, pathConnector, locales, publishedTime, modifiedTime,
}) => {
  const translationsExists = translations.length > 0;
  const maxCharacters = 155;
  const descriptionCleaned = description.length > maxCharacters
    ? `${description.substring(0, maxCharacters)}...`
    : description;

  const cardLayout = {
    default: 'summary', // Title, description, and thumbnail.
    large: 'summary_large_image', // Similar to the Summary Card, but with a prominently-featured image.
    app: 'app', // A Card with a direct download to a mobile app.
  };

  return (
    <Head>
      {/* <!-- Primary Meta Tags --> */}
      {/* <html lang="en" /> */}
      {/* <link rel="canonical" href={`${siteUrl}${pagePath}`} /> */}
      {/* <meta name="keywords" content={keywords} /> */}

      {locales.length > 0 && !translationsExists && (
        <link rel="canonical" hrefLang="x-default" href={`https://4geeks.com${pathConnector}`} />
      )}

      {/* <---------------- Single web pages (ex: /projects) ----------------> */}
      {locales.length > 0 && !translationsExists && locales.map((lang) => lang !== 'default' && (
        <link key={`${lang} - ${pathConnector}`} rel="canonical" hrefLang={lang} href={`https://4geeks.com/${lang}${pathConnector}`} />
      ))}

      {/* <---------------- Assets ----------------> */}
      {translationsExists && Object.keys(translations).map((lang) => {
        const language = lang === 'us' ? 'en' : lang;
        const urlAlternate = `https://4geeks.com/${language}${pathConnector}/${translations[lang]}`;

        return (
          <link
            key={`${lang} - ${translations[lang]}`}
            rel="alternate"
            hrefLang={language}
            href={urlAlternate}
          />
        );
      })}

      <title>{title}</title>
      <meta name="description" content={descriptionCleaned} />
      {unlisted === true && <meta name="robots" content="noindex" />}
      <meta name="image" content={image} />
      <link rel="icon" href="/4Geeks.ico" />

      {/* <---------------- Open Graph protocol ----------------> */}
      <meta property="og:site_ame" content="4Geeks" />
      <meta name="og:title" contentn={title} />
      <meta name="og:url" content={url} />
      <meta property="og:description" content={descriptionCleaned} />
      <meta property="og:image" content={image} />

      <meta property="og:type" content={type} />
      {type === 'article' && publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {type === 'article' && modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* <---------------- Twitter ----------------> */}
      {/* <meta name="twitter:card" content={image} /> */}
      <meta name="twitter:card" content={cardLayout[card]} />
      <meta name="twitter:site" content={twitterUser} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={descriptionCleaned} />
      <meta name="twitter:image" content={image} />
      {/* <meta name="twitter:image" content={image} /> */}
    </Head>
  );
};

Helmet.propTypes = {
  title: PropTypes.string,
  url: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  type: PropTypes.string,
  twitterUser: PropTypes.string,
  unlisted: PropTypes.bool,
  translations: PropTypes.objectOf(PropTypes.any),
  pathConnector: PropTypes.string,
  locales: PropTypes.arrayOf(PropTypes.string),
  publishedTime: PropTypes.string,
  modifiedTime: PropTypes.string,
  card: PropTypes.string,
};

Helmet.defaultProps = {
  title: '4Geeks',
  url: 'https://4geeks.com',
  description: "4Geeks's mission is to accelerate the way software developers learn and evolve.",
  image: 'https://raw.githubusercontent.com/4GeeksAcademy/website-v2/master/src/assets/logos/favicon.png',
  type: 'website',
  twitterUser: '@4GeeksAcademy',
  unlisted: false,
  translations: {},
  pathConnector: '',
  locales: [],
  publishedTime: '',
  modifiedTime: '',
  card: 'default',
};

export default Helmet;
