module.exports = {
  pages: {
    '*': ['common', 'navbar', 'footer'],
    '/': ['home'],
    '/example': ['common', 'counter'],
    '/cohort/[cohortSlug]/[slug]/[version]': ['dashboard'],
    '/interactive-exercises': ['exercises'],
    '/projects': ['projects'],
    '/read/[slug]': ['read'],
    '/interactive-coding-tutorial/[difficulty]/[slug]': ['projects'],
    '/interactive-exercises/[slug]': ['exercises'],
  },
  locales: ['en', 'es'],
  defaultLocale: 'en',
  localeDetection: true,
  // return a Promise with the JSON file.
  loadLocaleFrom: (lang, ns) => import(`./public/locales/${lang}/${ns}.json`).then((m) => m.default),
};
