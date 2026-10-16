import {
  Box,
  Flex,
  Text,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Portal,
  useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { memo, useState } from 'react';
import Icon from '../Icon';
import NextChakraLink from '../NextChakraLink';
import useStyle from '../../hooks/useStyle';
import { ArrowDown } from '../Icon/components';
import { parseQuerys } from '../../utils/url';
import { getColorVariations } from '../../utils';

const withCtaPlacement = (href, placement) => `${href}${parseQuerys({ internal_cta_placement: placement }, href.includes('?'))}`;

function LearnMegaMenu({ item }) {
  const { hexColor, lightColor, fontColor, fontColor2, backgroundColor } = useStyle();
  const popoverBorderColor = useColorModeValue('gray.250', 'gray.dark');
  const bgColorVariations = item?.bgColor ? getColorVariations(item.bgColor) : {};
  const textColorVariations = item?.titleColor ? getColorVariations(item.titleColor) : {};
  const itemBackgroundColor = useColorModeValue(bgColorVariations?.light?.mode1, bgColorVariations?.dark?.mode5);
  const itemTextColor = useColorModeValue(textColorVariations?.light?.mode1, textColorVariations?.dark?.mode1);
  const [activeIndex, setActiveIndex] = useState(0);

  const categories = Array.isArray(item.mainMenu) ? item.mainMenu : [];
  const activeCategory = categories[activeIndex] || categories[0];

  if (categories.length === 0) return null;

  return (
    <Box position="relative">
      <Popover
        trigger="hover"
        placement="bottom-start"
        offset={[-50, 24]}
        onClose={() => setActiveIndex(0)}
      >
        {({ isOpen }) => (
          <>
            <PopoverTrigger>
              <Button
                variant="unstyled"
                display="flex"
                flexDirection="row"
                fontWeight={700}
                color={isOpen ? 'blue.default' : lightColor}
                fontSize="14px"
                _hover={{ color: 'blue.default', textDecoration: 'none' }}
              >
                {item.label}
                <span>
                  <ArrowDown color="currentColor" width="22px" height="22px" />
                </span>
              </Button>
            </PopoverTrigger>
            <Portal>
              <PopoverContent
                zIndex={100}
                mx="2"
                width="580px"
                bg={hexColor.lightGreyBackground}
                rounded="md"
                border="1px solid"
                borderColor={popoverBorderColor}
                boxShadow="lg"
                p="8px"
              >
                <PopoverBody p={0}>
                  <Flex gap="8px" minHeight="260px">
                    <Flex direction="column" width="260px" p="8px" bg={itemBackgroundColor}>
                      <Text fontWeight="bold" fontSize="18px" color={itemTextColor}>
                        {item.label}
                      </Text>
                      {item.description && (
                        <Text fontSize="14px" color={fontColor} mt="8px" mb="16px">
                          {item.description}
                        </Text>
                      )}
                      <Flex direction="column" gap="2px" role="listbox" aria-label={item.railLabel || item.label}>
                        {categories.map((category, index) => {
                          const isActive = index === activeIndex;
                          return (
                            <Button
                              key={category.id || category.label}
                              variant="unstyled"
                              role="option"
                              aria-selected={isActive}
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                              height="auto"
                              px="10px"
                              py="8px"
                              borderRadius="md"
                              fontSize="14px"
                              fontWeight={isActive ? 700 : 500}
                              color={isActive ? itemTextColor : fontColor2}
                              bg={isActive ? backgroundColor : 'transparent'}
                              _hover={{ bg: backgroundColor, color: itemTextColor }}
                              onMouseEnter={() => setActiveIndex(index)}
                              onFocus={() => setActiveIndex(index)}
                            >
                              <Text as="span" textAlign="left" whiteSpace="normal">{category.label}</Text>
                              <Icon icon="arrowRight" width="10px" height="10px" color={isActive ? hexColor.blueDefault : 'currentColor'} />
                            </Button>
                          );
                        })}
                      </Flex>
                    </Flex>

                    <Box flex="1" p="8px" bg={backgroundColor} aria-live="polite">
                      <Text fontWeight="bold" color={itemTextColor} fontSize="12px" mb="8px">
                        {activeCategory.label}
                      </Text>
                      <Flex direction="column" gap="4px">
                        {(activeCategory.subMenu || []).map((course) => (
                          <NextChakraLink
                            key={course.href || course.label}
                            href={withCtaPlacement(course.href, `navbar-${item.id}-${activeCategory.id}`)}
                            display="block"
                            py={1}
                            px={2}
                            ml={-2}
                            borderRadius="md"
                            fontSize="sm"
                            color={fontColor2}
                            _hover={{ color: itemTextColor, textDecoration: 'none' }}
                          >
                            {course.label}
                          </NextChakraLink>
                        ))}
                      </Flex>
                    </Box>
                  </Flex>
                </PopoverBody>
              </PopoverContent>
            </Portal>
          </>
        )}
      </Popover>
    </Box>
  );
}

LearnMegaMenu.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string.isRequired,
    description: PropTypes.string,
    bgColor: PropTypes.string,
    titleColor: PropTypes.string,
    railLabel: PropTypes.string,
    mainMenu: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      label: PropTypes.string,
      subMenu: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string,
        href: PropTypes.string,
      })),
    })),
  }).isRequired,
};

export default memo(LearnMegaMenu);
