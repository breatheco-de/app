/* eslint-disable no-param-reassign */
import fs from 'fs';
import { getAsset, getEvents, getLandingTechnologies, getAssetsFromCache, setAssetsOnCache } from '../src/utils/requests';

async function getData() {
  console.log('fetching recyclable data for sitemap and redirects...');

  console.time('Time fetching data');

  let lessons;
  let excersises;
  let projects;
  let howTos;
  let assets = await getAssetsFromCache();
  if (!assets) {
    console.log('No assets from cache. Fetching from breathecode');
    lessons = await getAsset('LESSON,ARTICLE', { exclude_category: 'how-to,como' }, 'lesson');
    excersises = await getAsset('EXERCISE', {}, 'excersise');
    projects = await getAsset('PROJECT', {}, 'project');
    howTos = await getAsset('LESSON,ARTICLE', { category: 'how-to,como' }, 'how-to');
    assets = {
      lessons,
      excersises,
      projects,
      howTos,
    };
    await setAssetsOnCache(assets);
  } else {
    lessons = assets.lessons;
    excersises = assets.excersises;
    projects = assets.projects;
    howTos = assets.howTos;
  }

  const events = await getEvents();
  const landingTechnologies = await getLandingTechnologies([...lessons, ...projects, ...excersises, ...howTos]);

  console.timeEnd('Time fetching data');

  const data = {
    landingTechnologies,
    lessons,
    excersises,
    projects,
    howTos,
    events,
  };
  console.log('Next data has been fetched:\n', {
    landingTechnologies: landingTechnologies?.length,
    lessons: lessons?.length,
    excersises: excersises?.length,
    projects: projects?.length,
    howTos: howTos?.length,
    events: events?.length,
  });

  // This file is disposable and will disappear at the end of the build process.
  fs.writeFileSync('src/lib/asset-list.json', JSON.stringify(data));

  return data;
}
getData();
