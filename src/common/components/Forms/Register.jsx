import React from "react";
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
import Icon from "../../../common/components/Icon/index";

function Register() {
    return (
      <Stack spacing={6}>
        <FormControl>
          <Text color="gray.default" fontSize="sm" float="left">
            Full Name
          </Text>
          <Input
            type="fullName"
            placeholder="Andrea Castillo"
            height="50px"
            borderColor="gray.default"
            borderRadius="3px"
          />
        </FormControl>
        <FormControl>
          <Text color="gray.default" fontSize="sm" float="left">
            Email
          </Text>
          <Input
            type="email"
            placeholder="Andrea@4geeks.co"
            height="50px"
            borderColor="gray.default"
            borderRadius="3px"
          />
        </FormControl>
        <FormControl>
          <Text color="gray.default" fontSize="sm" float="left">
            Date of Birth
          </Text>
          <Input
            type=""
            placeholder="29 / 10 / 1990"
            height="50px"
            borderColor="gray.default"
            borderRadius="3px"
          />
        </FormControl>
        <FormControl>
          <Text color="gray.default" fontSize="sm" float="left">
            Password
          </Text>
          <Input
            type="password"
            placeholder="***********"
            height="50px"
            borderColor="gray.default"
            borderRadius="3px"
          />
        </FormControl>
        <FormControl>
          <Text color="gray.default" fontSize="sm" float="left">
            Repeat Password
          </Text>
          <Input
            type="password"
            placeholder="***********"
            height="50px"
            borderColor="gray.default"
            borderRadius="3px"
          />
        </FormControl>
        <Button variant="default" fontSize="l">
          REGISTER
        </Button>
      </Stack>
    );
}

export default Register;
