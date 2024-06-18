// Created to enable i18n namespaces to be used in storybook
const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../public/locales');
const outputDir = path.join(__dirname, '../.storybook/generated');
const outputFile = path.join(outputDir, 'namespaces.json');
const namespaces = {};

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.readdirSync(localesDir).forEach((locale) => {
  namespaces[locale] = {};
  const localeDir = path.join(localesDir, locale);
  fs.readdirSync(localeDir).forEach((file) => {
    if (file.endsWith('.json')) {
      const namespace = file.replace('.json', '');
      const filePath = path.join(localeDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      namespaces[locale][namespace] = JSON.parse(fileContent);
    }
  });
});
fs.writeFileSync(outputFile, JSON.stringify(namespaces, null, 2));
console.log('i18n namespaces generated successfully.');
