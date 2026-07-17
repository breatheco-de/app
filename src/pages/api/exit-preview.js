import { exitPreview } from '@prismicio/next';
import { isPrismicEnabled } from '../../utils/variables';

export default async function exit(req, res) {
  if (!isPrismicEnabled) {
    res.status(404).json({ message: 'Prismic preview is disabled' });
    return;
  }

  await exitPreview({ res, req });
}
