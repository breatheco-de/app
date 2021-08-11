import {
  Box,
  Flex,
  Avatar,
  HStack,
  IconButton,
  useDisclosure,
  useColorModeValue,
  InputRightElement,
  InputGroup,
  Input,
  Stack,
} from '@chakra-ui/react';
import NavLink from './navLink';
import PropTypes from 'prop-types';
import Icon from "./Icon";

const linkStyle = {
  textDecoration: "none",
  color:"inherit",
  textAlign: "center",
  fontWeight:"900",
  color:"#606060",
}

const iconStyles = {
  marginRight:"7px",
}

const Navbar = ({menuList, user : { handleUser, avatar } }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px="25px" py="18px"  borderBottom={"1px solid #DADADA"}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            icon={isOpen ? null : <Icon icon="hamburger" width="40px" height="40px"/>}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={20} alignItems={'center'}>
            <Box>
              <Icon icon="logo" width="40px" height="40px" />
            </Box>
            <HStack
              as={'nav'}
              spacing={20}
              display={{ base: 'none', md: 'flex' }}>
              {menuList.map((nav) => (
                <NavLink 
                  key={nav.title} 
                  leftIcon={nav.icon} 
                  href={nav.link}
                  style={linkStyle}
                  iconStyles={iconStyles}
                  iconHeight="20px" 
                  iconWidth="20px"
                  iconColor="gray"
                >
                  {nav.title.toUpperCase()}
                </NavLink>
              ))}
            </HStack>
          </HStack>
          <HStack spacing={20} alignItems={'center'}>
            <HStack
              as={'nav'}
              spacing={20}
              display={{ base: 'none', md: 'flex' }}>
                <InputGroup>
                  <Input placeholder="Basic usage" />
                  <InputRightElement children={<Icon color="black" icon="search" width="20px" height="20px"/>} />
                </InputGroup>
                
                <Icon icon="light" width="25px" height="25px" color="black"/>
                <Icon icon="bell" width="25px" height="25px" color="black"/>
            </HStack>
            <Box>
              <Avatar
                onClick={handleUser}
                width="40px"
                height="40px"
                src={avatar}
              />
            </Box>
          </HStack>
        </Flex>
        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={4}>
              {menuList.map((link) => (
                <NavLink key={link.title} href={link.link}>{link.title}</NavLink>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  );
}

Navbar.propTypes = {
  menuList:PropTypes.array.isRequired,
  user:PropTypes.object.isRequired,
};
Navbar.defaultProps = {
  menuList:[
    {
     icon: "home",
     title: "Dashboard",
     link: "/"
    },
    {
     icon: "book",
     title: "Learn",
     link: "/learn"
    },
    {
     icon: "message",
     title: "Mentoring",
     link: "/mentoring"
    },
    {
     icon: "people",
     title: "Community",
     link: "/community"
    },
  ],
  user: {
    avatar:"https://storage.googleapis.com/media-breathecode/639857ed0ceb0a5e5e0429e16f7e3a84365270a0977fb94727cc3b6450d1ea9a",
    handleUser: () => {
    }
  },
};

export default Navbar;