/* eslint-disable consistent-return */
import bc from '../../../common/services/breathecode';
import { getExtensionName } from '../../../utils';
import { setCacheItem } from '../../../utils/requests';

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
      // const asset = req.body;
      const { assetSlug } = req.query;

      const response = await bc.get(`${BREATHECODE_HOST}/v1/registry/asset/${assetSlug}`);
      const asset = await response.json();

      if (!asset || response.status >= 400) return res.status(404).json({ message: `Asset not found for ${assetSlug}` });
      const type = getAssetType(asset);
      if (!type) return res.status(200).json({ message: `Asset type not superted for ${asset.slug}` });

      const exensionName = getExtensionName(asset.readme_url);
      let markdown = '';
      let ipynbHtml = '';
      if (exensionName !== 'ipynb') {
        const resp = await bc.get(`${BREATHECODE_HOST}/v1/registry/asset/${assetSlug}.md`);
        if (resp.status >= 400) {
          return {
            notFound: true,
          };
        }
        markdown = await resp.text();
      } else {
        const ipynbIframe = `${BREATHECODE_HOST}/v1/registry/asset/preview/${assetSlug}`;
        const ipynbHtmlUrl = `${BREATHECODE_HOST}/v1/registry/asset/${assetSlug}.html`;
        const resp = await bc.get(ipynbHtmlUrl);

        ipynbHtml = {
          html: await resp.text(),
          iframe: ipynbIframe,
          statusText: resp.statusText,
          status: resp.status,
        };
      }
      asset.markdown = markdown;
      asset.ipynbHtml = ipynbHtml;

      await setCacheItem(assetSlug, asset);

      res.status(200).json({ message: `${asset.slug} updated` });
    } catch (e) {
      console.log(e);
    }
  }
}
