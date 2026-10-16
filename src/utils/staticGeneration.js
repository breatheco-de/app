/**
 * Helpers to keep Next.js SSG builds from failing when an upstream API
 * or local asset list is temporarily unavailable.
 */

export const SAFE_STATIC_FALLBACK = 'blocking';

/**
 * Always-safe getStaticPaths result: build continues; pages generate on demand.
 */
export const emptyStaticPaths = (fallback = SAFE_STATIC_FALLBACK) => ({
  paths: [],
  fallback,
});

/**
 * Runs a getStaticPaths loader and never throws.
 * `loader` must return an array of path objects (or a full { paths, fallback }).
 */
export const withSafeStaticPaths = async (loader, options = {}) => {
  const fallback = options.fallback ?? SAFE_STATIC_FALLBACK;
  try {
    const result = await loader();
    if (Array.isArray(result)) {
      return { paths: result, fallback };
    }
    if (result && Array.isArray(result.paths)) {
      return {
        paths: result.paths,
        fallback: result.fallback ?? fallback,
      };
    }
    console.error('getStaticPaths loader returned invalid paths:', result);
    return emptyStaticPaths(fallback);
  } catch (error) {
    console.error('getStaticPaths failed:', error);
    return emptyStaticPaths(fallback);
  }
};

/**
 * Runs a getStaticProps loader and returns notFound instead of crashing the build.
 */
export const withSafeStaticProps = async (loader, contextLabel = 'page') => {
  try {
    return await loader();
  } catch (error) {
    console.error(`getStaticProps failed for ${contextLabel}:`, error);
    return { notFound: true };
  }
};

/**
 * Builds locale-aware paths from a list of items.
 * Skips items without a valid slug and ignores non-array inputs.
 */
export const buildLocalePaths = (items, locales, paramKey = 'slug', getSlug = (item) => item?.slug) => {
  if (!Array.isArray(items) || !Array.isArray(locales)) return [];

  return items.flatMap((item) => {
    const slug = getSlug(item);
    if (slug == null || String(slug).trim() === '') return [];

    return locales.map((locale) => ({
      params: { [paramKey]: String(slug) },
      locale,
    }));
  });
};
