import { remark } from 'remark';
import emoji from 'remark-emoji';
import toc from 'remark-toc';
import variables from 'remark-variables';
import html from 'remark-html';

const markdownToHtml = async (markdown) => {
  const result = remark()
    .use(emoji)
    .use(toc)
    .use(variables)
    .use(html)
    .processSync(markdown);
  console.log(result.data, 'sdasdasdatessssstss');
  return result.toString();
};

export default markdownToHtml;
