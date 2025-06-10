import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Img } from '@chakra-ui/react';
import axios from 'axios';
import GridContainer from './GridContainer';
import DraggableContainer from './DraggableContainer';
// import modifyEnv from '../../../modifyEnv';
import { BREATHECODE_HOST } from '../utils/variables';
import { log } from '../utils/logging';

const defaultEndpoint = `${BREATHECODE_HOST}/v1/registry/technology?sort_priority=1`;

function Content({
  technologies,
  justifyContent,
  alignItems,
  gridSpacing,
  maxTechnologies,
  imageSize,
}) {
  return (
    <Box
      width="100%"
      display="flex"
      justifyContent={justifyContent}
      alignItems={alignItems}
      gridGap={gridSpacing}
      flexWrap="wrap"
    >
      {technologies.map((tech, i) => i < maxTechnologies && (
        <Img
          key={tech.slug}
          src={tech.icon_url}
          height={imageSize}
          width="auto"
          alt={tech?.title || tech?.slug}
        />
      ))}
    </Box>
  );
}

function MktTechnologies({
  id,
  endpoint,
  imageSize,
  gridSpacing,
  containerPadding,
  gridColumns,
  gridStart,
  gridEnd,
  justifyContent,
  alignItems,
  draggable,
  maxTechnologies,
  ...rest
}) {
  const [technologies, setTechnologies] = useState([]);

  useEffect(() => {
    try {
      axios
        .get(
          `${typeof endpoint === 'string' && endpoint !== ''
            ? endpoint
            : defaultEndpoint
          }`,
        )
        .then((response) => {
          setTechnologies(response.data?.filter((tech) => tech.icon_url && !tech.lang));
        });
    } catch (e) {
      log(e);
    }
  }, []);

  return (
    <GridContainer
      gridTemplateColumns={gridColumns}
      id={id}
      width="100%"
      position="relative"
      padding={containerPadding}
      {...rest}
    >
      <Box
        display={{ base: 'block', md: 'grid' }}
        gridColumn={`${gridStart} / ${gridEnd}`}
        padding={{ base: '0 10px', lg: '0' }}
      >
        {draggable ? (
          <DraggableContainer padding="0">
            <Content
              technologies={technologies}
              justifyContent={justifyContent}
              alignItems={alignItems}
              gridSpacing={gridSpacing}
              maxTechnologies={maxTechnologies}
              imageSize={imageSize}
            />
          </DraggableContainer>
        ) : (
          <Content
            technologies={technologies}
            justifyContent={justifyContent}
            alignItems={alignItems}
            gridSpacing={gridSpacing}
            maxTechnologies={maxTechnologies}
            imageSize={imageSize}
          />
        )}
      </Box>
    </GridContainer>
  );
}

MktTechnologies.propTypes = {
  endpoint: PropTypes.string,
  id: PropTypes.string,
  imageSize: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  gridSpacing: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  containerPadding: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  gridColumns: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  gridStart: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  gridEnd: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  justifyContent: PropTypes.string,
  alignItems: PropTypes.string,
  draggable: PropTypes.bool,
  maxTechnologies: PropTypes.number,
};

MktTechnologies.defaultProps = {
  id: '',
  endpoint: defaultEndpoint,
  imageSize: '60px',
  gridSpacing: '15px',
  containerPadding: { base: '5px 10px', lg: '5px 40px' },
  gridColumns: 'repeat(10, 1fr)',
  gridStart: '2',
  gridEnd: 'span 8',
  justifyContent: 'space-between',
  alignItems: 'center',
  draggable: true,
  maxTechnologies: 15,
};

Content.propTypes = {
  technologies: PropTypes.arrayOf(PropTypes.shape({
    slug: PropTypes.string.isRequired,
    icon_url: PropTypes.string.isRequired,
    title: PropTypes.string,
  })).isRequired,
  justifyContent: PropTypes.string,
  alignItems: PropTypes.string,
  gridSpacing: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  maxTechnologies: PropTypes.number,
  imageSize: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

Content.defaultProps = {
  justifyContent: 'center',
  alignItems: 'center',
  gridSpacing: '10px',
  maxTechnologies: 100,
  imageSize: '20px',
};

export default MktTechnologies;
