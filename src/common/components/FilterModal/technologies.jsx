import {
  Box, Flex, Checkbox, useMediaQuery, Collapse, Input, InputGroup, InputLeftElement,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import useStyle from '../../hooks/useStyle';
import Icon from '../Icon';
import Text from '../Text';

// eslint-disable-next-line react/prop-types
function TechnologiesSection({
  t,
  title,
  show,
  commonBorderColor,
  commonTextColor,
  checkedTechnologies,
  technologyTags,
  handleToggle,
  getCheckboxProps,
}) {
  const [technologySearched, setTechnologySearched] = useState('');
  const { fontColor, hexColor, modal, borderColorStrong } = useStyle();
  const [isMobile] = useMediaQuery('(min-width: 1082px)');
  const filteredTechnologies = technologyTags.filter((technology) => technology.slug.toLowerCase().includes(technologySearched.toLowerCase()));

  return (
    <Flex flexDirection="column" padding="0 0 12px 0" borderBottom={1} borderStyle="solid" borderColor={commonBorderColor}>
      <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} gridGap="8px" justifyContent="space-between" padding="18px 0" alignItems="center">
        <Text fontSize="1rem" textTransform="uppercase" fontWeight="bold" color={commonTextColor}>
          {title}
        </Text>
        <InputGroup w="auto">
          <InputLeftElement
            height="29px"
            pointerEvents="none"
          >
            <Icon icon="search" color={hexColor.black} width="14px" height="14px" />
          </InputLeftElement>
          <Input type="text" onChange={(e) => setTechnologySearched(e.target.value)} placeholder={t('seach-technology')} border="1px solid" borderColor={borderColorStrong} height="29px" w="290px" borderRadius="48px" />
        </InputGroup>

      </Box>
      <Collapse className="force-overflow" in={show} startingHeight={technologyTags.length > 4 ? 170 : 38}>
        <Flex
          flexFlow="row wrap"
          padding="5px"
          gridGap="20px"
        >
          {filteredTechnologies.map((technology) => {
            const checkbox = getCheckboxProps({
              value: technology.slug,
              checked: checkedTechnologies.length === 0
                ? false
                : checkedTechnologies.includes(technology.slug),
              isChecked: false,
            });

            return (
              <Box
                key={technology.slug}
                border="1px solid"
                borderColor={checkbox.checked ? 'blue.default' : borderColorStrong}
                backgroundColor={checkbox.checked ? 'blue.default' : modal.background}
                borderRadius="15px"
                p="4px 9px"
                as="label"
                cursor="pointer"
                _focus={{
                  boxShadow: 'outline',
                }}
              >
                <Flex gridGap="10px">
                  <Checkbox display="none" {...checkbox} borderColor="gray.default" isChecked={checkbox.checked} />
                  <Text size="l" color={checkbox.checked ? 'white' : fontColor}>{technology.title}</Text>
                </Flex>
              </Box>
            );
          })}
        </Flex>
      </Collapse>
      {(filteredTechnologies.length >= 17 || (!isMobile && filteredTechnologies.length >= 10)) && (
      <Flex width="100%" justifyContent="right">
        <Box
          as="button"
          margin="20px 0"
          color="blue.default"
          cursor="pointer"
          fontSize="14px"
          onClick={handleToggle}
        >
          {show ? t('show-less') : t('show-more')}
        </Box>
      </Flex>
      )}
    </Flex>
  );
}

TechnologiesSection.propTypes = {
  t: PropTypes.func,
  title: PropTypes.string,
  show: PropTypes.bool.isRequired,
  commonBorderColor: PropTypes.string.isRequired,
  commonTextColor: PropTypes.string.isRequired,
  checkedTechnologies: PropTypes.arrayOf(PropTypes.string).isRequired,
  technologyTags: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  handleToggle: PropTypes.func.isRequired,
  getCheckboxProps: PropTypes.func.isRequired,
};

TechnologiesSection.defaultProps = {
  t: () => {},
  title: 'TECHNOLOGIES',
};

export default TechnologiesSection;
