import {
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Link,
  Stack,
  Text,
  Box,
  Input,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import bg from "../../public/static/images/main-bg1.png";
import Image from "next/image";
import logo from "../../public/static/images/bc_logo.png";
import Login from '../common/components/Forms/LogIn';
import Register from "../common/components/Forms/Register";

function login() {
  return (
    <Stack minH={"100vh"} direction={{ base: "column", lg: "row" }} >
      <Flex p={8} flex={1} align={"center"} justify={"center"}>
        <Stack spacing={4} w={"full"} maxW={"md"}>
          <Box align={"center"} justify={"center"}>
            <Image src={logo} height="67px" width="67px" />
          </Box>
          <Stack spacing={6}>
            <Tabs isFitted variant="enclosed">
              <Stack spacing={8}>
                <TabList align={"center"} justify={"center"}>
                  <Tab
                    _selected={{
                      color: "gray.dark",
                      bg: "white",
                      borderBottomColor: "blue.default",
                      borderBottomWidth: "3px",
                    }}
                    color="gray.default"
                    boxShadow="none !important"
                    fontWeight="600"
                    backgroundColor="white"
                    padding="17px"
                    borderBottomColor="gray.200"
                    borderTop="none"
                    borderRight="none"
                    borderLeft="none"
                  >
                    Log In
                  </Tab>
                  <Tab
                    _selected={{
                      color: "gray.dark",
                      bg: "white",
                      borderBottomColor: "blue.default",
                      borderBottomWidth: "3px",
                    }}
                    color="gray.default"
                    boxShadow="none !important"
                    fontWeight="600"
                    backgroundColor="white"
                    padding="17px"
                    borderBottomColor="gray.200"
                    borderTop="none"
                    borderRight="none"
                    borderLeft="none"
                  >
                    Registration
                  </Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <Login />
                  </TabPanel>
                  <TabPanel>
                    <Register />
                  </TabPanel>
                </TabPanels>
              </Stack>
            </Tabs>
          </Stack>
        </Stack>
      </Flex>
      <Flex>
        <Box
          display={{ base: "none", sm: "none", md: "none", lg: "block" }}
        >
          <Image src={bg} objectFit="cover"  />
        </Box>
      </Flex>
    </Stack>
  );
}

export default login;
