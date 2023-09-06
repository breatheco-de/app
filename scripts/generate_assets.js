/* eslint-disable no-param-reassign */
const fs = require('fs');
const { getAsset, getEvents, getLandingTechnologies } = require('../src/utils/requests');

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
  const name = 'fetching data';
  const loading = (function () {
    const h = [`${name}`, `${name}.`, `${name}..`, `${name}...`];
    let i = 0;

    return setInterval(() => {
      i = (i > 3) ? 0 : i;
      console.clear();
      console.log(h[i]);
      i += 1;
    }, 300);
  }());

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
  console.log('Fetched next data:\n', {
    landingTechnologies: landingTechnologies.length,
    lessons: lessons.length,
    excersises: excersises.length,
    projects: projects.length,
    howTos: howTos.length,
  });
  clearInterval(loading);

  // This file is disposable and will disappear at the end of the build process.
  fs.writeFileSync('src/lib/asset-list.json', JSON.stringify(data));

  return data;
}
getData();
