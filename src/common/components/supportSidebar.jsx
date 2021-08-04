import { Box, Heading, Text, Button } from "@chakra-ui/react";
import Icon from "./Icon";

// [height, weight, color]
const supportSidebar = () => {
  const defaultProps = "450px";
  let actionButtons = [
    {
      buttonTitle: "title1",
      buttonIcon: "conversation",
      buttonFunction: () => console.log("button1"),
    },
    {
      buttonTitle: "title2",
      buttonIcon: "conversation",
      buttonFunction: () => console.log("button2"),
    },
    {
      buttonTitle: "title3",
      buttonIcon: "conversation",
      buttonFunction: () => console.log("button3"),
    },
  ];
  return (
    <Box
      backgroundColor="#FFF4DC"
      width={defaultProps}
      borderWidth="0px"
      borderRadius="lg"
      overflow="hidden"
    >
      <Box d="flex" justifyContent="center">
        <Icon icon="sidesupport" width="300px" height="70px" />
      </Box>
      <Box p="4">
        <Box d="flex" alignItems="baseline" justifyContent="center">
          <Heading textAlign="center" justify="center">
            Don&#39;t Get Stuck
          </Heading>
        </Box>

        <Box pt="3" d="flex" alignItems="baseline" justifyContent="center">
          <Text fontSize="xl" textAlign="center">
            Did you know you can schedule mentoring sessions any time or ask in
            the Support Chat?
          </Text>
        </Box>

        <Box pt="3" display="flex" flexDirection="column" alignItems="center">
          {actionButtons.map((button) => (
            <Button
              size="lg"
              key={button.buttonTitle}
              bg="#FFFFFF"
              width="75%"
              px="15px"
              my="8px"
              justifyContent="left"
            >
              <Box pr="20px">
                <Icon icon={button.buttonIcon} width="25px" height="25px" />
              </Box>
              <Heading as="h3" fontSize="20px">
                {button.buttonTitle}
              </Heading>
              <Box ml="auto">
                <Icon icon="arrowright" width="25px" height="25px" />
              </Box>
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default supportSidebar;
