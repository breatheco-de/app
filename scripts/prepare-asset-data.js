/* eslint-disable no-param-reassign */
import fs from 'fs';
import { getAsset, getEvents, getLandingTechnologies } from '../src/utils/requests';
import { categoriesFor, excludeCagetoriesFor } from '../src/utils/variables';

async function prepareAssetData() {
  console.log('fetching data for sitemap and redirects...');

  console.time('Time fetching data');

  const lessons = await getAsset('LESSON,ARTICLE', { exclude_category: excludeCagetoriesFor.lessons, expand: 'technologies' }, 'lesson');
  const excersises = await getAsset('EXERCISE', { expand: 'technologies' }, 'excersise');
  const projects = await getAsset('PROJECT', { expand: 'technologies' }, 'project');
  const howTos = await getAsset('LESSON,ARTICLE', { category: categoriesFor.howTo, expand: 'technologies' }, 'how-to');
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
  console.log('\nNext data has been fetched:\n', {
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
export default prepareAssetData;
