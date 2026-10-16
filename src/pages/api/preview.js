import { setPreviewData, redirectToPreviewURL } from '@prismicio/next';
import { createClient } from '../../../prismicio';
import { isPrismicEnabled } from '../../utils/variables';

export default async (req, res) => {
  if (!isPrismicEnabled) {
    res.status(404).json({ message: 'Prismic preview is disabled' });
    return;
  }

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
