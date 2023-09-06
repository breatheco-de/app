/* eslint-disable no-param-reassign */
const { getAsset, getEvents } = require('./requests');

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
  const lessons = await getAsset('LESSON,ARTICLE', { exclude_category: 'how-to,como' });
  const excersises = await getAsset('exercise');
  const project = await getAsset('PROJECT').then((data) => data.map((item) => {
    item.difficulty = mapDifficulty(item.difficulty);
    return item;
  }));
  const howTo = await getAsset('LESSON,ARTICLE').then(
    (data) => data.filter((l) => l?.category?.slug === 'how-to' || l?.category?.slug === 'como'),
  );
  const event = await getEvents();

  console.log('building the routes for lessons, exercises, project, howto and event');
  return {
    lessons,
    excersises,
    project,
    howTo,
    event,
  };
}

module.exports = getData;
