import { useRouter } from 'next/router';

const testPage = () => {
  const router = useRouter();
  const { slug, slug2 } = router.query;
  return (
    <div>
      {`test page with slugs ${slug} and ${slug2}`}
    </div>
  );
};

export default testPage;
