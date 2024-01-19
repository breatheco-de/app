module.exports = {
  pages: {
    // Enable translations for the following pages
    '*': ['common', 'navbar', 'footer', 'alert-message', 'share', 'live-event', 'call-to-action', 'code-viewer', 'program-card', 'final-project', 'profile', 'login', 'signup'],
    '/': ['home', 'social'],
    '/login': ['login', 'signup'],
    '/example': ['counter'],
    '/cohort/[cohortSlug]/[slug]/[version]': ['dashboard', 'choose-program', 'projects', 'profile'],
    '/cohort/[cohortSlug]/assignments': ['assignments'],
    '/cohort/[cohortSlug]/student/[studentId]': ['student', 'assignments'],
    '/cohort/[cohortSlug]/attendance': ['attendance'],
    '/docs/[syllabusSlug]/[assetSlug]': ['docs'],
    '/interactive-exercises': ['exercises'],
    '/technology/[slug]': ['technologies'],
    '/read/[slug]': ['read'],
    '/lesson/[slug]': ['lesson'],
    '/lessons': ['lesson'],
    '/project/[slug]': ['projects'],
    '/checkout': ['signup'],
    '/interactive-coding-tutorial/[slug]': ['projects'],
    '/interactive-coding-tutorials': ['projects'],
    '/interactive-exercise/[slug]': ['exercises', 'workshops'],
    '/choose-program': ['choose-program', 'dashboard', 'profile'],
    '/syllabus/[cohortSlug]/[lesson]/[lessonSlug]': ['syllabus', 'dashboard', 'projects'],
    '/survey/[surveyId]': ['survey'],
    '/mentorship': ['mentorship'],
    '/how-to': ['how-to'],
    '/pricing': ['pricing', 'signup'],
    '/how-to/[slug]': ['how-to'],
    '/profile': ['profile'],
    '/profile/[slug]': ['profile'],
    '/thank-you': ['thank-you'],
    '/workshops/[event_slug]': ['workshops', 'signup'],
    '/join/cohort/[id]': ['dashboard', 'signup'],
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
