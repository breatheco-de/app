module.exports = {
  pages: {
    // Enable translations for the following pages
    '*': ['common', 'navbar', 'footer', 'alert-message', 'share'],
    '/': ['home', 'social'],
    '/login': ['login'],
    '/example': ['counter'],
    '/cohort/[cohortSlug]/[slug]/[version]': ['dashboard'],
    '/cohort/[cohortSlug]/[slug]/[version]/assignments': ['assignments'],
    '/interactive-exercises': ['exercises'],
    '/interactive-coding-tutorial': ['projects'],
    '/read/[slug]': ['read'],
    '/lesson/[slug]': ['lesson'],
    '/lessons': ['lesson'],
    '/project/[slug]': ['projects'],
    '/interactive-coding-tutorial/[difficulty]/[slug]': ['projects'],
    '/interactive-exercise/[slug]': ['exercises'],
    '/choose-program': ['choose-program'],
    '/syllabus/[cohortSlug]/[lesson]/[lessonSlug]': ['syllabus', 'dashboard'],
    '/survey/[surveyId]': ['survey'],
    '/mentorship': ['mentorship'],
    '/how-to': ['how-to'],
    '/how-to/[slug]': ['how-to'],
    '/profile': ['profile'],
    '/profile/[slug]': ['profile'],
    '/thank-you': ['thank-you'],
    '/about-us': ['about-us'],
  },
  locales: ['en', 'es'],
  defaultLocale: 'en',
  localeDetection: false,

  // locales: ['default', 'en', 'es'],
  // // defaultLocale: 'en', // removed for redirects handling purposes
  // defaultLocale: 'default',
  // localeDetection: false, // run and detects in home page = '/'

  // return a Promise with the JSON file.

  loadLocaleFrom: (lang, ns) => import(`./public/locales/${lang}/${ns}.json`).then((m) => m.default),

  // loadLocaleFrom: (lang, ns) => {
  //   if (lang === 'default') return '';
  //   return import(`./public/locales/${lang}/${ns}.json`).then((m) => m.default);
  // },
};
