// import { useRouter } from 'next/router';
// import PropTypes from 'prop-types';
import React from 'react';

import Masonry from 'react-masonry-css';
import {
  Box,
  Image,
  Text,
  Tag,
  Link,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Button,
  Divider,
} from '@chakra-ui/react';
import {
  SearchIcon,
  CloseIcon,
  ArrowForwardIcon,
  HamburgerIcon,
} from '@chakra-ui/icons';

function Talentcard() {
  const roleTags = [
    { name: 'Fullstack Developer', color: '#0097CF', bg: '#EEF9FE' },
    { name: 'Python', color: '#0097CF', bg: '#EEF9FE' },
    { name: 'South America', color: '#0097CF', bg: '#EEF9FE' },
    { name: 'A2-B1', color: '#0097CF', bg: '#EEF9FE' },
    { name: 'CSS', color: '#0097CF', bg: '#EEF9FE' },
  ];

  const skillTags = [
    { name: 'React', color: '#0097CF', bg: '#EEF9FE' },
    { name: 'Python', color: '#FFB718', bg: '#FFF4DC' },
    { name: 'Full Stack Developer', color: '#FF9099', bg: '#FFF4DC' },
  ];

  const breakpointColumnsObj = {
    default: 3,
    1100: 3,
    768: 2,
    500: 1,
  };

  const talentNames = [
    'Sofía Ramírez',
    'Diego Fernández',
    'Valentina Gómez',
    'Mateo Rodríguez',
    'Camila Torres',
    'Lucas Méndez',
    'Sofía Ramírez',
    'Diego Fernández',
    'Valentina Gómez',
    'Mateo Rodríguez',
    'Camila Torres',
    'Lucas Méndez',
  ];

  return (
    <Box mb={10} ms={10} mx={10}>
      <Box>
        <Flex justify="space-between" align="center" mb={4} ml={3} my={3}>
          <Link href="/" _hover={{ textDecoration: 'none' }}>
            <Text color="blue.500" fontWeight="bold">
              ← Atrás
            </Text>
          </Link>
        </Flex>
      </Box>

      <Box bg="#EEF9FE" p={10} borderRadius="md" mt={4} mb={6}>
        {/* Search Bar */}
        <InputGroup size="lg">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.500" />
          </InputLeftElement>
          <Input placeholder="Full Stack developer" borderRadius="md" />
          <InputRightElement>
            <Button size="sm" bg="#0097CF" _hover={{ bg: '#0077A8' }}>
              <ArrowForwardIcon
                color="white"
                boxSize={6}
                transform="scaleX(1.0)"
              />
            </Button>
          </InputRightElement>
        </InputGroup>

        <Flex justify="space-between" align="center" mt={4} w="100%">
          {/* "Mostrando resultados" */}
          <Text mt={2} fontSize="sm" color="gray.600" fontWeight={400}>
            Mostrando resultados por
          </Text>
          {/* Filter Button */}
          <Button
            leftIcon={<HamburgerIcon />}
            mt={2}
            size="sm"
            colorScheme="blue"
            bg="#0097CF"
          >
            Filters
          </Button>
        </Flex>

        {/* Tags con opción de eliminar */}
        <Flex mt={2} gap={2} flexWrap="wrap">
          {roleTags.map((tag, index) => (
            <Tag
              key={index.id}
              size="md"
              borderRadius="full"
              px={3}
              color={tag.color}
              bg={tag.bg}
            >
              {tag.name}
              <CloseIcon
                ml={2}
                boxSize={2.5}
                cursor="pointer"
                color={tag.color}
              />
            </Tag>
          ))}
        </Flex>
      </Box>

      <Box>
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="masonry-grid"
          columnClassName="masonry-grid_column"
        >
          {[...Array(12)].map((_, index) => {
            const randomTag = skillTags[Math.floor(Math.random() * skillTags.length)];
            console.log('randomTag', randomTag);
            console.log('skillTags', skillTags);
            return (
              <Box
                key={index.id}
                borderRadius="lg"
                overflow="hidden"
                boxShadow="md"
                bg="white"
                p={4}
                className="masonry-brick"
                width="100%"
              >
                <Image
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN3xX1RXNq1mEfRGra5AXgd7zixQv1GjHHbg&s"
                  alt="Talent Profile"
                  borderRadius="md"
                  mb={4}
                  width="100%"
                />
                <Flex
                  key={index.id}
                  justify="space-between"
                  align="center"
                  mb={2}
                >
                  <Text fontSize="lg" fontWeight="bold">
                    {talentNames[index]}
                  </Text>
                  <Tag
                    color={randomTag.color}
                    bg={randomTag.bg}
                    px={3}
                    borderRadius="full"
                  >
                    {randomTag.name}
                  </Tag>
                </Flex>
                <Divider borderColor="gray.300" />
                <Text fontSize="md" color="gray.600" my={2}>
                  Passionate about data-drive problem-solving, with a keen
                  interest in collaboration on eco-friendly iniciatives and
                  building a career as a Data Science.
                </Text>
                <Flex justify="center">
                  <Link href="/profile" _hover={{ textDecoration: 'none' }}>
                    <Text color="blue.500" fontWeight="bold">
                      Ver Perfil
                    </Text>
                  </Link>
                </Flex>
              </Box>
            );
          })}
        </Masonry>
      </Box>
    </Box>
  );
}

export default Talentcard;
