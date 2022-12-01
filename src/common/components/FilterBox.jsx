/* eslint-disable no-unused-vars */
import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Divider,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Flex,
  AvatarGroup,
  Progress,
} from '@chakra-ui/react';
import { Search2Icon, CloseIcon } from '@chakra-ui/icons';
import useTranslation from 'next-translate/useTranslation';
import { formatDuration, intervalToDuration } from 'date-fns';
import { es, en } from 'date-fns/locale';
import Heading from './Heading';
import Text from './Text';
import CustomTheme from '../../../styles/theme';
import Link from './NextChakraLink';
import Icon from './Icon';

const FilterBox = ({ stTranslation, techLimit }) => {
  const { t, lang } = useTranslation('filter-box');
  const grayText = useColorModeValue('gray.600', 'gray.light');
  const bgColor = useColorModeValue('featuredLight', 'featuredDark');
  const [selected, setSelected] = useState(null);
  const [showMore, setShowMore] = useState(false);

  const technologies = [
    'python',
    'javascript',
    'java',
    'html',
    'css',
    'javascript',
    'javascript',
    'java',
    'python',
    'html',
    'java',
    'javascript',
    'html',
    'css',
    'javascript',
    'java',
    'python',
    'html',
    'css',
    'java',
    'html',
    'css',
    'javascript',
  ];

  return (
    <Box width={['300px', '300px', '500px', '540px']} padding="10px 20px" border="1px solid" borderRadius="22px" borderColor="#DADADA">
      <Flex justifyContent="space-between" alignItems="center">
        <Text fontWeight="900" fontSize="15px" textTransform="uppercase">
          {stTranslation ? stTranslation[lang]['filter-box'].filters : t('filters')}
        </Text>
        <CloseIcon
          width="16px"
          height="16px"
          onClick={() => console.log('aja')}
          cursor="pointer"
        />
      </Flex>
      <Divider margin="15px 0" />
      <Box>
        <Flex justifyContent="space-between" alignItems="center">
          <Text color={grayText} fontWeight="900" fontSize="15px" textTransform="uppercase">
            {stTranslation ? stTranslation[lang]['filter-box'].technologies : t('technologies')}
          </Text>
          <InputGroup maxWidth="290px" height="30px">
            <InputLeftElement
              pointerEvents="none"
              height="30px"
              // eslint-disable-next-line react/no-children-prop
              children={<Search2Icon />}
            />
            <Input
              background={bgColor}
              width="100%"
              borderRadius="50px"
              placeholder={stTranslation ? stTranslation[lang]['filter-box'].search : t('search')}
              height="30px"
            />
          </InputGroup>
        </Flex>
        <Flex justifyContent="space-between" margin="25px 0" flexWrap="wrap">
          {technologies.map((tech, i) => ((i < techLimit || showMore) && (
            <Box
              marginRight="10px"
              marginTop="10px"
              cursor="pointer"
              padding="4px 9px"
              borderRadius="50px"
              border="1px solid"
              borderColor={selected === i ? CustomTheme.colors.blue.default2 : grayText}
              onClick={() => setSelected(i)}
              background={selected === i && CustomTheme.colors.blue.default2}
            >
              <Text
                color={selected === i ? CustomTheme.colors.white : grayText}
                fontWeight="400"
                fontSize="11px"
                textTransform="uppercase"
              >
                {tech}
              </Text>
            </Box>
          )))}
        </Flex>
        <Flex flexDirection="row-reverse">
          <Button
            variant="ghost"
            fontWeight="900"
            fontSize="11px"
            textTransform="uppercase"
            size="xs"
            onClick={() => setShowMore(!showMore)}
          >
            {stTranslation ? stTranslation[lang]['filter-box']['see-all'] : t('see-all')}
          </Button>
        </Flex>
      </Box>
      <Divider margin="15px 0" />
    </Box>
  );
};

FilterBox.propTypes = {
  stTranslation: PropTypes.objectOf(PropTypes.any),
  techLimit: PropTypes.number,
};

FilterBox.defaultProps = {
  stTranslation: null,
  techLimit: 18,
};

export default FilterBox;
