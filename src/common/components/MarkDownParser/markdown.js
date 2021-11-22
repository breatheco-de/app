import matter from 'gray-matter';

const getMarkDownContent = (_content) => {
  const { data, content } = matter(_content);
  console.log('DATA:::', data);
  console.log('CONTENT', content);
  return {
    frontMatter: data,
    content,
  };
};

export default getMarkDownContent;
