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

function LogIn() {
  return (
    <Stack spacing={6}>
      <Button cursor="pointer" variant="outline" weight="700">
        <Icon icon="github" width="18px" height="18px" />
        <Text fontSize="13px" marginLeft="10px">
          LOG IN WITH GITHUB
        </Text>
      </Button>
      <Box display="flex" justifyContent="center" width="100%">
        <Box
          borderBottom="solid 1px #DADADA"
          width="165px"
          marginRight="13px"
        />
        <Box color="gray.default">or</Box>
        <Box borderBottom="solid 1px #DADADA" width="165px" marginLeft="14px" />
      </Box>
      <FormControl id="email" borderRadius="3px">
        <Input
          type="email"
          placeholder="Email"
          height="50px"
          autoComplete="off"
          borderColor="gray.default"
          borderRadius="3px"
        />
      </FormControl>
      <FormControl id="password" borderRadius="3px">
        <Input
          type="password"
          placeholder="Password"
          height="50px"
          borderColor="gray.default"
          borderRadius="3px"
        />
      </FormControl>
      <Box
        color="blue.default"
        fontWeight="700"
        align="right"
      >
        Reset Password
      </Box>
      <Button
        disabled=""
        variant="default"
        fontSize="l"
      >
        LOGIN
      </Button>
    </Stack>
  );
}

export default LogIn;
