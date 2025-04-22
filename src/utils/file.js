const fs = require('fs');
const path = require('path');

function getDataContentSlugs(dirFiles, locales) {
  const fileNames = fs.readdirSync(dirFiles);

  return fileNames.flatMap((fileName) => locales.map((locale) => ({
    params: {
      slug: fileName.replace(/\.json$/, ''),
    },
    locale,
  })));
}

function getDataContentProps(dirFiles, slug) {
  const fullPath = path.join(dirFiles, `${slug}.json`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  return {
    slug,
    ...JSON.parse(fileContents),
  };
}

export {
  getDataContentSlugs, getDataContentProps,
};
