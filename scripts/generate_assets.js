/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
import { getAsset, getEvents, getLandingTechnologies } from '../src/utils/requests';

const fs = require('fs');
// fs.writeFileSync('src/lib/asset-list.json', JSON.stringify(data));

const mapDifficulty = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'junior':
      return 'easy';
    case 'semi-senior':
      return 'intermediate';
    case 'senior':
      return 'hard';
    default:
      return 'unknown';
  }
};

async function getData() {
  console.log('fetching recyclable data for sitemap and redirects...');

  console.time('Time fetching data');

  const landingTechnologies = await getLandingTechnologies();
  const lessons = await getAsset('LESSON,ARTICLE', { exclude_category: 'how-to,como' });
  const excersises = await getAsset('exercise');
  const projects = await getAsset('PROJECT').then((data) => data.map((item) => {
    item.difficulty = mapDifficulty(item.difficulty);
    return item;
  }));
  const howTos = await getAsset('LESSON,ARTICLE').then(
    (data) => data.filter((l) => l?.category?.slug === 'how-to' || l?.category?.slug === 'como'),
  );
  const events = await getEvents();

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
    landingTechnologies: landingTechnologies.length,
    lessons: lessons.length,
    excersises: excersises.length,
    projects: projects.length,
    howTos: howTos.length,
  });

  // This file is disposable and will disappear at the end of the build process.
  fs.writeFileSync('src/lib/asset-list.json', JSON.stringify(data));
  // await Bun.write('src/lib/asset-list.json', JSON.stringify(data));

  return data;
}
getData();
