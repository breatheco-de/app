import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import Link from './NextChakraLink';
import { parseQuerys } from '../utils/url';

const getDefaultPath = (assetType) => {
  switch (assetType) {
    case 'lesson':
      return '/lessons';
    case 'interactive-coding-tutorial':
      return '/interactive-coding-tutorials';
    case 'interactive-exercise':
      return '/interactive-exercises';
    case 'how-to':
      return '/how-to';
    default:
      return '/';
  }
};

export default function Breadcrumb() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { query } = router;
  const assetType = router.pathname.split('/')[1];

  const handleGoBack = () => {
    const defaultPath = getDefaultPath(assetType);
    const { slug, ...queryParams } = query;
    const search = parseQuerys(queryParams);
    return `${defaultPath}${search}`;
  };

  return (
    <Link
      href={handleGoBack()}
      color="blue.default"
      display="inline-block"
      letterSpacing="0.05em"
      fontWeight="700"
      paddingBottom="10px"
      width="fit-content"
    >
      {`← ${t(`back-to-asset.${assetType}`)}`}
    </Link>
  );
}
