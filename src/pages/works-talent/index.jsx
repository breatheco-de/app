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
} from '@chakra-ui/react';
import {
  SearchIcon,
  ArrowRightIcon,
  CloseIcon,
  SettingsIcon,
} from '@chakra-ui/icons';

function Talentcard() {
  const tags = ['React', 'Node.js', 'UI/UX', 'Python'];
  const breakpointColumnsObj = {
    default: 3,
    1100: 3,
    768: 2,
    500: 1,
  };

  return (
    <Box mb={10} ms={10} mx={10}>
      <Box>
        <Flex justify="space-between" align="center" mb={4} ml={10} my={3}>
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
          <Input placeholder="Buscar talentos..." borderRadius="md" />
          <InputRightElement>
            <Button size="sm" variant="ghost">
              <ArrowRightIcon color="gray.600" />
            </Button>
          </InputRightElement>
        </InputGroup>

        <Flex justify="space-between" align="center" mt={4} w="100%">
          {/* "Mostrando resultados" */}
          <Text mt={2} fontSize="sm" color="gray.600">
            Mostrando resultados
          </Text>
          {/* Filter Button */}
          <Button
            leftIcon={<SettingsIcon />}
            mt={2}
            size="sm"
            colorScheme="blue"
          >
            Filter
          </Button>
        </Flex>

        {/* Tags con opción de eliminar */}
        <Flex mt={2} gap={2} flexWrap="wrap">
          {tags.map((tag, index) => (
            <Tag
              key={index.id}
              size="md"
              colorScheme="blue"
              borderRadius="full"
              px={3}
            >
              {tag}
              {' '}
              <CloseIcon ml={2} boxSize={2} cursor="pointer" />
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
          {[...Array(6)].map((_, index) => (
            <Box
              key={index.id}
              borderRadius="lg"
              overflow="hidden"
              boxShadow="md"
              bg="white"
              p={4}
              className="masonry-brick"
            >
              <Image
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN3xX1RXNq1mEfRGra5AXgd7zixQv1GjHHbg&s"
                alt="Talent Profile"
                borderRadius="md"
                mb={4}
                width="100%"
              />

              <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="lg" fontWeight="bold">
                  Nombre del Talento
                </Text>
                <Tag colorScheme="blue">React</Tag>
              </Flex>

              <Text fontSize="md" color="gray.600" my={2}>
                Breve descripción del talento y su especialidad en la industria.
              </Text>

              <Flex justify="center">
                <Link href="/profile" _hover={{ textDecoration: 'none' }}>
                  <Text color="blue.500" fontWeight="bold">
                    Ver Perfil
                  </Text>
                </Link>
              </Flex>
            </Box>
          ))}
        </Masonry>
      </Box>
    </Box>
  );
}

export default Talentcard;
