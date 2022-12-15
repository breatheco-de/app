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
import Icon from './Icon';

const FilterBox = ({ stTranslation, techLimit, technologies }) => {
  const { t, lang } = useTranslation('filter-box');
  const grayText = useColorModeValue('gray.600', 'gray.light');
  const bgColor = useColorModeValue('featuredLight', 'featuredDark');
  const [selected, setSelected] = useState(null);
  const [selectedDif, setSelectedDif] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const [vidTutorial, setVidTutorial] = useState(false);
  const [filterText, setFilterText] = useState('');

  const difficulties = [{
    label: 'junior',
    level: 1,
    background: CustomTheme.colors.green.light,
    color: CustomTheme.colors.success,
  }, {
    label: 'mid level',
    level: 2,
    background: CustomTheme.colors.yellow['100'],
    color: CustomTheme.colors.yellow.default,
  }, {
    label: 'senior',
    level: 3,
    background: CustomTheme.colors.red.light,
    color: CustomTheme.colors.danger,
  }];

  const clearFilters = () => {
    setSelected(null);
    setSelectedDif(null);
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
            return el.toLowerCase().includes(filterText);
          }).map((tech, i) => ((i < techLimit || showMore) && (
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
            {stTranslation ? stTranslation[lang]['filter-box'][showMore ? 'see-less' : 'see-all'] : t(showMore ? 'see-less' : 'see-all')}
          </Button>
        </Flex>
      </Box>
      <Divider margin="15px 0" />
      <Box>
        <Text color={grayText} fontWeight="900" fontSize="15px" textTransform="uppercase">
          {stTranslation ? stTranslation[lang]['filter-box'].dificulties : t('dificulties')}
        </Text>
        <Flex justifyContent="space-between" marginTop="20px">
          {difficulties.map((dif) => (
            <Box cursor="pointer" onClick={() => setSelectedDif(dif.label)}>
              <Flex justifyContent="center">
                {difficulties.map((thunder, i) => i < dif.level && (
                  <Icon
                    width="17px"
                    height="17px"
                    color={selectedDif === dif.label ? dif.color : null}
                    icon="thunder"
                  />
                ))}
              </Flex>
              <Box
                marginTop="10px"
                cursor="pointer"
                padding="4px 9px"
                borderRadius="50px"
                background={dif.background}
              >
                <Text
                  color={dif.color}
                  fontWeight="700"
                  fontSize="11px"
                  textTransform="uppercase"
                >
                  {dif.label}
                </Text>
              </Box>
            </Box>
          ))}
        </Flex>
      </Box>
      <Divider margin="15px 0" />
      <Flex justifyContent="space-between" paddingTop="10px">
        <Text fontWeight="900" fontSize="15px" textTransform="uppercase">
          {stTranslation ? stTranslation[lang].tutorials.filters : t('tutorials')}
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
