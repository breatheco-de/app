import{ useState, useEffect } from 'react';
import { Heading, Container, Button, Flex } from '@chakra-ui/react'
import PropTypes from 'prop-types';
// import  from 'prop-types';

const options = {
    desktop: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    mobile: [10,9,8,7,6,5,4,3,2,1]
} 

const Question = ({ question, onChange }) => {
    const [focused, setFocused] = useState(-1);
    useEffect(() => {
        if(parseInt(question.score, 10)) setFocused(question.score - 1);
    }, question.score)
    return (
        <div>
            <Container centerContent={true} maxW={'80%'}>
                <Heading textAlign={'center'}>{question.message}</Heading>
            </Container>
            <Flex justify="center" marginTop="20px" >
                <div >
                    {question.lowest}
                </div>
                <div className="" style={{ maxWidth: "570px" }}>
                    {
                        options.desktop.map((number, index) =>
                            <Button 
                                variant='outline'
                                marginLeft='5px'
                                marginRight='5px'
                                className={`${focused >= index ? "bg-primary text-white" : ""}`}
                                onClick={() => { 
                                    setFocused(number - 1); 
                                    onChange({ ...question, score: number }); 
                                }}
                            >
                                {number}
                            </Button>)
                    }
                </div>
                <div className="col-1 col-lg-2 text-left pt-3">
                    {question.highest}
                </div>
            </Flex>
        </div>
    )
}

Question.defaultProps = {
    onChange: () => {},
  }

Question.propTypes = {
    question: PropTypes.shape({
        lowest: PropTypes.string,
        highest: PropTypes.string,
        message: PropTypes.string,
        score: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]),
    }).isRequired,
    onChange: PropTypes.func,
  };

export default Question