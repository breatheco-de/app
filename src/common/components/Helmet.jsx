/* eslint-disable react/no-danger */
import React from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';

const Helmet = ({
  title, description, url, previewImage, type, unlisted,
  stonlyScript,
}) => (
  <Head>
    {/* <!-- Primary Meta Tags --> */}
    {/* <html lang="en" /> */}
    {/* <link rel="canonical" href={`${siteUrl}${pagePath}`} /> */}
    {/* <meta name="keywords" content={keywords} /> */}

    <script
    // Stonly tracking script
      dangerouslySetInnerHTML={{
        __html: `
          (function(s,t,o,n,l,y,_) {
            if (s.stonlyTrack) return;
            _ = s.stonlyTrack = function() {
              _._api ? _._api.apply(_, arguments) : _.queue.push(arguments);
            };
            _.queue = [];
            y = t.createElement(o);
            y.async = !0;
            y.src = n;
            l = t.getElementsByTagName(o)[0];
            l.parentNode.insertBefore(y, l);
          })(window,document,'script','https://stonly.com/js/tracker/stn.js');
          stonlyTrack('init', '188858a7-c5a4-11ec-9fb8-0ae9fa2a18a2');
          ${stonlyScript}
        `,
      }}
    />

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
  stonlyScript: PropTypes.string,
};

Helmet.defaultProps = {
  title: '4Geeks',
  url: 'https://4geeks.com',
  description:
    "4Geeks's mission is to accelerate the way software developers learn and evolve.",
  previewImage: 'https://raw.githubusercontent.com/4GeeksAcademy/website-v2/master/src/assets/logos/favicon.png',
  type: 'website',
  unlisted: false,
  stonlyScript: '',
};

export default Helmet;
