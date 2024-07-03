import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Img } from '@chakra-ui/react';
import axios from 'axios';
import GridContainer from './GridContainer';
import DraggableContainer from './DraggableContainer';
import modifyEnv from '../../../modifyEnv';
import { log } from '../../utils/logging';

const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });

const defaultEndpoint = `${BREATHECODE_HOST}/v1/registry/technology?sort_priority=1`;

function MktTechnologies({ id, endpoint, ...rest }) {
  const [technologies, setTechnologies] = useState([]);
  const limit = 15;
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
      gridTemplateColumns="repeat(10, 1fr)"
      id={id}
      width="100%"
      position="relative"
      padding={{ base: '5px 10px', lg: '5px 40px' }}
      {...rest}
    >
      <Box
        display={{ base: 'block', md: 'grid' }}
        gridColumn="2 / span 8"
        padding={{ base: '0 10px', lg: '0' }}
      >
        <DraggableContainer padding="0">
          <Box
            width="100%"
            display="flex"
            justifyContent={{ base: 'space-between', lg: 'space-between' }}
            gridGap="15px"
          >
            {technologies.map((tech, i) => i < limit && (
              <Img
                // opacity={i === index ? '1' : '0.3'}
                key={tech.slug}
                src={tech.icon_url}
                height="60px"
                width="auto"
                alt={tech?.title || tech?.slug}
              />
            ))}
          </Box>
        </DraggableContainer>
      </Box>
    </GridContainer>
  );
}

MktTechnologies.propTypes = {
  endpoint: PropTypes.string,
  id: PropTypes.string,
};

MktTechnologies.defaultProps = {
  id: '',
  endpoint: defaultEndpoint,
};

export default MktTechnologies;
