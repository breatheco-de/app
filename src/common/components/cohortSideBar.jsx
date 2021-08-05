import { Box, Heading , Text, Image } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Icon from './Icon';

const CohortSideBar = ({title, cohortCity, professor, assistant, classmates}) => {
  return (
    <Box maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden" bg="lightBlue" padding={26} >
        <Heading as="h4" size="md" fontWeight="900" margin={0} marginBottom={18}>ABOUT YOUR COHORT</Heading>
        <Box d="flex" alignItems="center" marginBottom={18}>
            <Icon icon="group" width="39px" height="39px"/>
            <Box marginLeft={13}>
                <Heading as="h4" size="md" lineHeight="tight" margin={0}>{title}</Heading>
                <Text fontSize="md" lineHeight="tight" margin={0}>{cohortCity}</Text>
            </Box>
        </Box>
        <Box d="flex" alignItems="center" marginBottom={18}>
            <Image width="39px" height="39px"/>
            <Box marginLeft={13}>
                <Heading as="h4" size="md" lineHeight="tight" margin={0}>Main Teacher</Heading>
                <Text fontSize="md" lineHeight="tight" margin={0}>{professor.name}</Text>
            </Box>
        </Box>
    </Box>
  );
};

CohortSideBar.propTypes = {
    title:PropTypes.string,
    cohortCity: PropTypes.string,
    professor: PropTypes.object,
    assistant: PropTypes.array,
    classmates: PropTypes.array,
};
CohortSideBar.defaultProps = {
    title:"Test Cohort Side Bar",
    cohortCity: "Miami Downtown",
    professor: {
        name: "Paolo Lucano",
        image: "",
        active: true
    },
    assistant: [
        {
         active: false,
         image: "image.com/..."
        },
        {
         active: true,
         image: ""
        },
    ],
    classmates: [
        {
          active: true,
          image: ""
        },
        {
          active: true,
          image: ""
        },
        {
          active: false,
          image: ""
        }
    ],
};

export default CohortSideBar;