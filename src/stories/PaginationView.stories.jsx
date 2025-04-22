import PaginatedView from '../components/PaginationView';

export default {
  title: 'Components/PaginatedView',
  component: PaginatedView,
  argTypes: {
    page: {
      control: {
        type: 'number',
        min: 1,
        max: 60,
      },
    },
  },
};


const Component = (args) => {
  const page = args?.page || getQueryString('page', 1);

  const handlePageChange = (props) => {
    console.log('handlePageChange:', props);
  };

  const contentPerPage = args?.contentPerPage || 5;
  const startIndex = (page - 1) * contentPerPage;

  const queryFunction = async () => {
    const lessonResp = await fetch(`https://breathecode-test.herokuapp.com/v1/registry/asset?asset_type=lesson&limit=${contentPerPage}&offset=${startIndex}`);
    const data = await lessonResp.json();
    return data;
  };

  return (
    <PaginatedView
      storyConfig={args}
      queryFunction={queryFunction}
      options={{
        projectPath: args?.projectPath || 'lesson',
        pagePath: args?.pagePath || '/',
        contentPerPage,
        disableLangFilter: args?.disableLangFilter,
      }}
      handlePageChange={handlePageChange}
    />
  )
};

export const Default = Component.bind({});
Default.args = {
  page: 1,
  projectPath: 'lesson',
  pagePath: '/',
  contentPerPage: 5,
  disableLangFilter: true,
};

export const ContentPerPage30 = Component.bind({});
ContentPerPage30.args = {
  page: 1,
  projectPath: 'lesson',
  pagePath: '/',
  contentPerPage: 30,
  disableLangFilter: true,
};
export const MiddleOfPagination = Component.bind({});
MiddleOfPagination.args = {
  page: 5,
  projectPath: 'lesson',
  pagePath: '/',
  contentPerPage: 20,
  disableLangFilter: true,
};
export const FilteredByLang = Component.bind({});
FilteredByLang.args = {
  page: 1,
  projectPath: 'lesson',
  pagePath: '/',
  contentPerPage: 20,
  disableLangFilter: false,
};