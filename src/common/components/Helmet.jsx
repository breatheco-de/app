/* eslint-disable react/no-danger */
import React from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';

const Helmet = ({
  title, description, url, previewImage, type, unlisted,
}) => (
  <Head>
    {/* <!-- Primary Meta Tags --> */}
    {/* <html lang="en" /> */}
    {/* <link rel="canonical" href={`${siteUrl}${pagePath}`} /> */}
    {/* <meta name="keywords" content={keywords} /> */}

    <title>{title}</title>
    <meta name="description" content={description} />
    {unlisted === true && <meta name="robots" content="noindex" />}
    <meta name="image" content={previewImage} />
    {type === 'blog' ? (
      <meta property="og:type" content="article" />
    ) : (
      <meta property="og:type" content="website" />
    )}
    <link rel="icon" href="/4Geeks.ico" />
    <meta name="og:title" content={title} />
    <meta name="og:url" content={url} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={previewImage} />

    {/* <!-- Twitter --> */}
    <meta name="twitter:card" content={previewImage} />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={previewImage} />
  </Head>
);

Helmet.propTypes = {
  title: PropTypes.string,
  url: PropTypes.string,
  description: PropTypes.string,
  previewImage: PropTypes.string,
  type: PropTypes.string,
  unlisted: PropTypes.bool,
};

Helmet.defaultProps = {
  title: '4Geeks',
  url: 'https://4geeks.com',
  description:
    "4Geeks's mission is to accelerate the way software developers learn and evolve.",
  previewImage: 'https://raw.githubusercontent.com/4GeeksAcademy/website-v2/master/src/assets/logos/favicon.png',
  type: 'website',
  unlisted: false,
};

export default Helmet;
