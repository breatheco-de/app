import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Box, Img, Button } from '@chakra-ui/react';
import axios from 'axios';
import Icon from './Icon';
import GridContainer from './GridContainer';
import modifyEnv from '../../../modifyEnv';
import { log } from '../../utils/logging';

const BREATHECODE_HOST = modifyEnv({ queryString: 'host', env: process.env.BREATHECODE_HOST });

const defaultEndpoint = `${BREATHECODE_HOST}/v1/registry/technology?sort_priority=1`;

function MktTechnologies({ id, endpoint, ...rest }) {
  const carousel = useRef(null);
  const [technologies, setTechnologies] = useState([]);
  const [index, setIndex] = useState(0);
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
          setTechnologies(response.data?.filter((tech) => tech.icon_url));
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
        {carousel.current?.clientWidth !== carousel.current?.scrollWidth && (
          <>
            <Button
              zIndex="10"
              transform="rotate(180deg)"
              padding="0 5px"
              width="20px"
              height="25px"
              position="absolute"
              top="50%"
              marginTop="-12.5px"
              left={{ base: '5px', md: '15px' }}
              minWidth="none"
              onClick={() => {
                setIndex(index >= technologies.length - 1 ? 0 : index + 1);
                carousel.current.scrollBy(-200, 0);
              }}
            >
              <Icon icon="arrowRight" width="5px" height="10px" />
            </Button>
            <Button
              zIndex="10"
              padding="0 5px"
              width="20px"
              height="25px"
              position="absolute"
              top="50%"
              marginTop="-12.5px"
              right={{ base: '5px', md: '15px' }}
              minWidth="none"
              onClick={() => {
                setIndex(index >= technologies.length - 1 ? 0 : index + 1);
                carousel.current.scrollBy(200, 0);
              }}
            >
              <Icon icon="arrowRight" width="5px" height="10px" />
            </Button>
          </>
        )}
        <Box
          ref={carousel}
          width="100%"
          display="flex"
          justifyContent={{ base: 'space-between', lg: 'space-between' }}
          overflowX="hidden"
          gridGap="15px"
          style={{ scrollBehavior: 'smooth' }}
        >
          {technologies.map((tech, i) => i < limit && (
            <Img
              // opacity={i === index ? '1' : '0.3'}
              key={tech.slug}
              src={tech.icon_url}
              height="60px"
              width="60px"
              alt={tech?.title || tech?.slug}
            />
          ))}
        </Box>
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
