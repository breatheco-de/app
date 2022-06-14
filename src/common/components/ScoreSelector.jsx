import { Heading, Container } from '@chakra-ui/react'
import PropTypes from 'prop-types';

const ScoreSelector = ({ question }) => {
    return(
        <div>
            <Container centerContent={true} maxW={'80%'}>
                <Heading textAlign={'center'}>{question.message}</Heading> 
            </Container>
        </div>
        
    )
}

// ScoreSelector.defaultProps = {
//     onChange: () => {},
//   }

ScoreSelector.propTypes = {
    question: PropTypes.shape({
        message: PropTypes.string,
    }).isRequired,
  };


export default ScoreSelector