import { setPreviewData, redirectToPreviewURL } from '@prismicio/next';
import { createClient } from '../../../prismicio';

export default async (req, res) => {
  const client = createClient({ req });

  await setPreviewData({ req, res });

  await redirectToPreviewURL({
    req,
    res,
    client,
    linkResolver: (doc) => {
      const lang = doc.lang.split('-')[0];
      if (lang !== 'en' || lang !== 'us') {
        return `/${lang}/${doc.uid}`;
      }
      return `/${doc.uid}`;
    },
  });
};
