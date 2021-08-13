/* eslint-disable no-console */
const fs = require('fs');
const { walk, success } = require('./_utils');

walk(`${__dirname}/../src/common/components/Icon/set`)
  .then((files) => {
    const slugs = [];
    for (let i = 0; i < files.length; i += 1) {
      const path = files[i];
      const slug = path.split('.')[0].substr(path.lastIndexOf('/') + 1);
      slugs.push(slug);
    }
    console.log('SLUG:::', slugs);
    fs.writeFile(`${__dirname}/..//src/common/utils/iconDict.json`, JSON.stringify(slugs), (err) => {
      if (err) return console.log(err);
      return success('\niconDict => /src/common/utils/iconDict.json\n');
    });
  })
  .catch((e) => console.error(e));
