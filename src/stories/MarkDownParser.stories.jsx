import React, { useEffect, useState } from 'react';
import MarkDownParser from '../common/components/MarkDownParser';
import getMarkDownContent from '../common/components/MarkDownParser/markdown';

export default {
  title: 'Components/MarkDownParser',
  component: MarkDownParser,
  argTypes: {},
};

const Component = (args) => {
  const [data, setData] = useState(null);
  useEffect(() => {
    (async () => {
      const results = await fetch(
        'https://raw.githubusercontent.com/breatheco-de/content/master/src/content/lesson/css-layouts.md',
      )
        .then((res) => res.text())
        .catch((err) => console.error(err));
      const markdownContent = getMarkDownContent(results);
      setData(markdownContent);
    })();
  }, [data]);
  return <MarkDownParser content={data ? data.content : '##Hello'} frontMatter={data ? data.frontMatter : ''} {...args} />;
};

export const Default = Component.bind({});
Default.args = {
  withToc: false,
  frontMatter: '',
};

export const ContentControl = Component.bind({});
ContentControl.args = {
  content: '',
  withToc: false,
};
