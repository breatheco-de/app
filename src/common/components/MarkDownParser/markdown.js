import matter from 'gray-matter';

const getMarkDownContent = (_content) => {
  const { data, content } = matter(_content);
  return {
    frontMatter: data,
    content,
  };
};

export default getMarkDownContent;
