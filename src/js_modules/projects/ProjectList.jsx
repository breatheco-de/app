import {
  Box,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import Masonry from 'react-masonry-css';
import { forwardRef } from 'react';
import Text from '../../common/components/Text';
import LoaderScreen from '../../common/components/LoaderScreen';
import DynamicContentCard from '../../common/components/DynamicContentCard';

export const getDifficultyColors = (currDifficulty) => {
  const background = {
    beginner: 'featuredLight',
    easy: 'green.light',
    intermediate: 'yellow.100',
    hard: 'red.light',
  };
  const color = {
    beginner: 'blue.default',
    easy: 'green.400',
    intermediate: '#FFB718',
    hard: 'danger',
  };
  return {
    bg: background[currDifficulty],
    color: color[currDifficulty],
  };
};

const ProjectList = forwardRef(({
  projects, isLoading, notFoundMessage, type,
}, ref) => {
  const { t } = useTranslation('common');

  const breakpointColumnsObj = {
    default: 3,
    1100: 3,
    700: 2,
    500: 1,
  };

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {projects.map((ex) => (
          <Box
            ref={ref || null}
            key={`${ex.slug}-${ex.difficulty}`}
            className="card pointer masonry-brick"
          >
            <DynamicContentCard
              type={type}
              key={`${ex.slug}-${ex.difficulty}`}
              data={ex}
              className="masonry-content"
            />

          </Box>
        ))}
      </Masonry>

      {isLoading && (
        <Box display="flex" justifyContent="center" mt="2rem" mb="10rem" position="relative">
          <LoaderScreen width="80px" height="80px" />
        </Box>
      )}

      {projects.length === 0 && (
        <Box height="50vh" width="100%">
          <Text size="20px" padding="30px 0" textAlign="center" fontWeight={500}>
            {notFoundMessage || t('search-not-found')}
          </Text>
        </Box>
      )}
    </>
  );
});

ProjectList.propTypes = {
  type: PropTypes.string.isRequired,
  notFoundMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  projects: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any]))).isRequired,
  isLoading: PropTypes.bool,
};

ProjectList.defaultProps = {
  notFoundMessage: '',
  isLoading: false,
};

export default ProjectList;
