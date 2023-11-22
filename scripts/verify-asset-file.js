import fs from 'fs';
import generateAssetFile from './prepare-asset-data';

function verifyAssetsFile() {
  fs.access('src/lib/asset-list.json', fs.constants.F_OK, (err) => {
    if (err) {
      console.log("\nGenerating asset-file.json because it's not found in /src/lib/asset-list.json\n");
      generateAssetFile();
      return;
    }
    console.log('\nINFO: asset-list.json file already exists, if you want to see the latest assets, please run:\n\n-- bun run generate_assets --\n\n');
  });
}

verifyAssetsFile();
