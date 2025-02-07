import { Box, Flex, Image } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Text from './Text';
import useStyle from '../hooks/useStyle';

function MktMultipleColumnCard({ id, title, columns, fontFamily, marginBottom, marginTop, maxWidth, ...rest }) {
  const limitedColumns = columns.slice(0, 5);
  const { navbarBackground } = useStyle();

  return (
    <Box maxWidth={maxWidth} textAlign="center" margin={`${marginTop} auto ${marginBottom || '40px'} auto`} {...rest}>
      {/* Título principal */}
      <Text fontSize="34px" fontWeight="bold" mb={6}>
        {title}
      </Text>

      <Flex
        flexWrap={{ base: 'wrap', lg: 'nowrap' }}
        gap={4}
        justifyItems="center"
        justifyContent="space-between"
      >
        {limitedColumns.map((column, index) => {
          const idKey = `column-${index}`;
          return (
            <Box
              key={idKey}
              width={{ base: '100%', md: '304px' }}
              maxWidth="1280px"
              height={{ base: '178px', md: '417px' }}
              borderRadius={{ base: '8px', md: '8px' }}
              padding={{ base: '8px', md: '8px' }}
              gap={{ base: '8px', md: '16px' }}
              bg={navbarBackground}
              display="flex"
              flexDirection={{ base: 'row-reverse', md: column.flex_direction }}
              justifyContent={{ base: 'center', md: 'space-between' }}
              boxShadow="sm"
              overflow="hidden"
              alignItems={{ base: 'center' }}
            >
              <Image
                src={column.image.url}
                alt="Column Image"
                width={{ base: '158px', md: '288px' }}
                height={{ base: '162px', md: '281px' }}
                borderRadius="8px"
                objectFit="cover"
              />
              <Box
                width={{ md: '288px' }}
                minHeight="82px"
                display="flex"
                flexDirection="column"
                justifyContent={{ base: 'flex-start', md: 'center' }}
                alignItems="start"
                alignSelf={{ base: 'baseline' }}
                padding={{ md: '8px' }}
                gap={{ base: '8px', md: '8px' }}
                wordBreak="break-word"
                textAlign="left"
              >
                <Text
                  fontWeight="bold"
                  fontSize="18px"
                  fontFamily={fontFamily}
                  lineHeight="21.6px"
                >
                  {`${index + 1}.  `}
                  {column.column_title}
                </Text>
                <Text
                  fontSize={{ base: '14px' }}
                  fontFamily={fontFamily}
                  lineHeight="21.6px"
                >
                  {column.column_description}
                </Text>
              </Box>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
}
MktMultipleColumnCard.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  columns: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])),
  columnBackground: PropTypes.string,
  fontFamily: PropTypes.string,
  marginBottom: PropTypes.string,
  marginTop: PropTypes.string,
  maxWidth: PropTypes.string,
};

MktMultipleColumnCard.defaultProps = {
  id: '',
  title: null,
  columns: [],
  columnBackground: null,
  fontFamily: 'Lato',
  marginTop: '',
  marginBottom: '',
  maxWidth: '',
};

export default MktMultipleColumnCard;
