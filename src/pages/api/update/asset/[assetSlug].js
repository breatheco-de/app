/* eslint-disable consistent-return */
import { kv } from '@vercel/kv';
import bc from '../../../../common/services/breathecode';

const BREATHECODE_HOST = process.env.BREATHECODE_HOST || 'https://breathecode-test.herokuapp.com';

const getAssetType = (asset) => {
  if (['ARTICLE', 'LESSON'].includes(asset.asset_type)) {
    if (['how-to', 'como'].includes(asset.category.slug)) return 'howTos';
    return 'lessons';
  }
  if (asset.asset_type === 'EXERCISE') return 'excersises';
  if (asset.asset_type === 'PROJECT') return 'projects';
  return null;
};

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    try {
      const assets = await kv.get('assets');
      if (assets) {
        // const asset = req.body;
        const { assetSlug } = req.query;

        const response = await bc.get(`${BREATHECODE_HOST}/v1/registry/asset/${assetSlug}`);
        const asset = await response.json();
        if (!asset) return res.status(404).json({ message: `Asset not found for ${assetSlug}` });
        const type = getAssetType(asset);
        if (!type) return res.status(200).json({ message: `Asset type not superted for ${asset.slug}` });
        const index = assets[type].findIndex((elem) => elem.id === asset.id);

        if (index === -1) assets[type].push(asset);
        else assets[type][index] = asset;

        await kv.set('assets', assets);

        res.status(200).json({ message: `${asset.slug} updated` });
      } else {
        res.status(200).json({ message: 'The cache is empty' });
      }
    } catch (e) {
      console.log(e);
    }
  }
}
