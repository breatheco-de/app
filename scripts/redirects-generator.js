/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
import axios from 'axios';
import { BREATHECODE_HOST, isWhiteLabelAcademy, WHITE_LABEL_ACADEMY } from '../src/utils/variables';
import assetLists from '../src/lib/asset-list.json';
import { parseQuerys } from '../src/utils/url';

const redirectConfig = {
  permanent: true,
};

const getAliasRedirects = async () => {
  const qs = parseQuerys({
    academy: WHITE_LABEL_ACADEMY,
  });
  const data = axios.get(`${BREATHECODE_HOST}/v1/registry/alias/redirect${qs}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error('Error getting alias redirects', err);
    });

  return data;
};

const connectorsDict = {
  EVENT: 'workshops',
  LESSON: 'lesson',
  EXERCISE: 'interactive-exercise',
  PROJECT: 'interactive-coding-tutorial',
  ARTICLE: 'how-to',
};

const langsDict = {
  es: '/es',
  us: '',
  en: '',
};

const redirectByLang = ({ slug, lang, assetType, initLang }) => {
  const assetTypeValue = assetType?.toUpperCase();
  if (assetTypeValue in connectorsDict) {
    const connector = connectorsDict[assetTypeValue];
    return {
      source: `${initLang ? `/${initLang}` : ''}/${connector}/${slug}`,
      destination: `${langsDict[lang]}/${connector}/${slug}`,
      ...redirectConfig,
    };
  }

  return null;
};

const generateAssetRedirect = (pages, type) => {
  const redirectList = pages.filter((page) => page.lang !== null)
    .map((page) => {
      const { slug, lang, asset_type: assetType } = page;
      const initLang = ['us', 'en'].includes(lang) ? 'es' : undefined;

      const redirect = redirectByLang({
        slug,
        lang,
        initLang,
        assetType: assetType || type,
      });
      return redirect;
    });
  return redirectList || [];
};

const generateAliasRedirects = async (redirects, projects) => {
  const list = projects.map((item) => ({
    source: `/project/${item.slug}`,
    type: 'PROJECT-REROUTE',
    destination: `/${item.lang === 'us' ? 'en' : item.lang}/interactive-coding-tutorial/${item.slug}`,
  }));
  const objectToAliasList = await Promise.all(Object.entries(redirects).map(async ([key, value]) => {
    const lang = value.lang === 'us' ? 'en' : value.lang;
    const getConnector = async () => {
      if (value.type === 'PROJECT') return 'interactive-coding-tutorial';
      if (value.type === 'LESSON') return 'lesson';
      if (value.type === 'EXERCISE') return 'interactive-exercise';
      if (value.type === 'ARTICLE' || value.type === 'QUIZ') return 'how-to';
      return null;
    };

    const connector = await getConnector();

    return ({
      source: `/${connector}/${key}`,
      type: value.type,
      destination: `/${lang}/${connector}/${value.slug}`,
    });
  }));
  return [...objectToAliasList, ...list];
};

async function generateRedirect() {
  if (!isWhiteLabelAcademy) {
    console.log('Generating redirects...');

    const lessonsList = assetLists.lessons;
    const excersisesList = assetLists.excersises;
    const projectList = assetLists.projects;
    const howToList = assetLists.howTos;
    const eventList = assetLists.events;

    const aliasRedirectList = await getAliasRedirects();

    const lessonRedirectList = generateAssetRedirect(lessonsList);
    const excersisesRedirectList = generateAssetRedirect(excersisesList);
    const projectRedirectList = generateAssetRedirect(projectList);
    const howToRedirectList = generateAssetRedirect(howToList);
    const eventRedirectList = generateAssetRedirect(eventList, 'EVENT');

    const aliasRedirectionList = await generateAliasRedirects(aliasRedirectList, projectList)
      .then((redirects) => redirects);

    const redirectJson = [
      ...lessonRedirectList,
      ...excersisesRedirectList,
      ...projectRedirectList,
      ...howToRedirectList,
      ...eventRedirectList,
    ];

    Bun.write('public/redirects-from-api.json', JSON.stringify(redirectJson));
    Bun.write('public/alias-redirects.json', JSON.stringify(aliasRedirectionList));

    console.log('Redirects generated!');
  } else {
    console.log('Redirects not generated, in white label academy');
  }
}
generateRedirect();
