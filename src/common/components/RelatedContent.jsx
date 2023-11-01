import PropTypes from 'prop-types';
import { Box } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { getAsset } from '../../utils/requests';
import useStyle from '../hooks/useStyle';

function RelatedContent({ type, extraQuerys, technologies, ...rest }) {
  const [content, setContent] = useState([]);
  const { featuredColor } = useStyle();

  const getRelatedContent = async () => {
    if (type) {
      const data = await getAsset(type, {
        ...extraQuerys,
        technologies,
      });
      setContent(data);
    }
  };
  useEffect(() => {
    // Fetch related content by technology
    // example: /v1/registry/asset?asset_type=PROJECT&technologies=HTTP
    // solo filtrar contenido relacionado al idioma de usuario
    getRelatedContent();
  }, []);

  return type && content.length > 0 && (
    <Box background={featuredColor} width="100%" {...rest}>
      asdasd
    </Box>
  );
}

RelatedContent.propTypes = {
  type: PropTypes.string.isRequired,
  extraQuerys: PropTypes.objectOf(PropTypes.oneOfType[PropTypes.any]),
  technologies: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
};
RelatedContent.defaultProps = {
  extraQuerys: {},
};

export default RelatedContent;
