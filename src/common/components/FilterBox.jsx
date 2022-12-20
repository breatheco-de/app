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
  Switch,
} from '@chakra-ui/react';
import { Search2Icon, CloseIcon } from '@chakra-ui/icons';
import useTranslation from 'next-translate/useTranslation';
import Text from './Text';
import CustomTheme from '../../../styles/theme';

const FilterBox = ({ stTranslation, techLimit, technologies }) => {
  const { t, lang } = useTranslation('filter-box');
  const grayText = useColorModeValue('gray.600', 'gray.light');
  const bgColor = useColorModeValue('featuredLight', 'featuredDark');
  const [selected, setSelected] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [vidTutorial, setVidTutorial] = useState(false);
  const [filterText, setFilterText] = useState('');

  const clearFilters = () => {
    setSelected([]);
    setVidTutorial(false);
    setFilterText('');
  };

  const inputHandler = (e) => {
    const lowerCase = e.target.value.toLowerCase();
    setFilterText(lowerCase);
  };

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
              onChange={inputHandler}
              value={filterText}
              width="100%"
              borderRadius="50px"
              placeholder={stTranslation ? stTranslation[lang]['filter-box'].search : t('search')}
              height="30px"
            />
          </InputGroup>
        </Flex>
        <Flex justifyContent="space-between" margin="25px 0" flexWrap="wrap">
          {technologies.filter((el) => {
            if (filterText === '') {
              return el;
            }
            // return the item which contains the user input
            return el.label.toLowerCase().includes(filterText);
          }).map((tech, i) => ((i < techLimit || showMore) && (
            <Box
              marginRight="10px"
              marginTop="10px"
              cursor="pointer"
              padding="4px 9px"
              borderRadius="50px"
              border="1px solid"
              borderColor={selected.includes(tech.id) ? CustomTheme.colors.blue.default2 : grayText}
              onClick={() => {
                if (!selected.includes(tech.id)) setSelected([...selected, tech.id]);
              }}
              background={selected.includes(tech.id) && CustomTheme.colors.blue.default2}
            >
              <Text
                color={selected.includes(tech.id) ? CustomTheme.colors.white : grayText}
                fontWeight="400"
                fontSize="11px"
                textTransform="uppercase"
              >
                {tech.label}
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
            {stTranslation ? stTranslation[lang]['filter-box'][showMore ? 'see-less' : 'see-all'] : t(showMore ? 'see-less' : 'see-all')}
          </Button>
        </Flex>
      </Box>
      <Divider margin="15px 0" />
      <Flex justifyContent="space-between" paddingTop="10px">
        <Text fontWeight="900" fontSize="15px" textTransform="uppercase">
          {stTranslation ? stTranslation[lang]['filter-box'].tutorials : t('tutorials')}
        </Text>
        <Switch
          size="lg"
          isChecked={vidTutorial}
          onChange={() => setVidTutorial(!vidTutorial)}
        />
      </Flex>
      <Divider margin="15px 0" />
      <Flex justifyContent="space-between" paddingTop="10px">
        <Button
          variant="ghost"
          fontWeight="700"
          size="md"
          color={CustomTheme.colors.blue.default2}
          onClick={() => clearFilters()}
        >
          {stTranslation ? stTranslation[lang]['filter-box'].clear : t('clear')}
        </Button>
        <Button
          fontWeight="700"
          variant="default"
          textTransform="uppercase"
          size="md"
        >
          {stTranslation ? stTranslation[lang]['filter-box'].apply : t('apply')}
        </Button>
      </Flex>
    </Box>
  );
};

FilterBox.propTypes = {
  stTranslation: PropTypes.objectOf(PropTypes.any),
  techLimit: PropTypes.number,
  technologies: PropTypes.arrayOf(PropTypes.any).isRequired,
};

FilterBox.defaultProps = {
  stTranslation: null,
  techLimit: 18,
};

export default FilterBox;
