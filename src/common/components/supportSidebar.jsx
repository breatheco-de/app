import { Box, Heading, Center } from "@chakra-ui/react";
// [height, weight, color]
const supportSidebar = () => {
  const defaultProps = "500px";
  return (
    <Box style={{backgroundColor: '#FFF4DC'}} width="500px" borderWidth="0px" borderRadius="lg" overflow="hidden">
      <svg width="87" height="50" viewBox="0 0 87 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="87" height="50" rx="9" fill="#FFB718"/>
<rect width="87" height="22" fill="#FFB718"/>
<path d="M38.748 28.013H37.5295L32.6555 33.0173V28.013H29V13H52.1515V21.132" stroke="white" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M42.4023 34.2683H49.1041L54.5874 39.2726V34.2683H57.0244V24.2596H42.4023V34.2683Z" stroke="white" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
  
      <Box p="6">
        <Box d="flex" alignItems="baseline">
          <Heading textAlign="center" justify="center">Don't Get Stuck</Heading>
        </Box>

        <Box>
          Price
          <Box as="span" color="gray.600" fontSize="sm">
            / wk
          </Box>
        </Box>

        <Box d="flex" mt="2" alignItems="center">
          {/* {Array(5)
            .fill("")
            .map((_, i) => (
              <StarIcon
                key={i}
                color={i < property.rating ? "teal.500" : "gray.300"}
              />
            ))} */}
          <Box as="span" ml="2" color="gray.600" fontSize="sm">
            Reviews
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default supportSidebar;
