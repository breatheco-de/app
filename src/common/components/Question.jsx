import{ useState, useEffect } from 'react';
import { Heading, Container, Button, Flex, Center } from '@chakra-ui/react'
import PropTypes from 'prop-types';
import TextArea from '../styledComponents/TextArea';
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
        <div style={{marginTop: "40px"}}>
            <Container centerContent={true} maxW={'80%'}>
                <Heading textAlign={'center'}>{question.message}</Heading>
            </Container>
            <Flex justify="center" marginTop="40px" >
                <Center >
                    {question.lowest}
                </Center>
                <div className="" style={{ maxWidth: "570px", margin: "0 20px" }}>
                    {
                        options.desktop.map((number, index) =>
                            <Button
                                marginLeft='5px'
                                marginRight='5px'
                                colorScheme={focused >= index ? 'messenger' : 'gray'}
                                onClick={() => { 
                                    setFocused(number - 1); 
                                    onChange({ ...question, score: number }); 
                                }}
                            >
                                {number}
                            </Button>)
                    }
                </div>
                <Center>
                    {question.highest}
                </Center>
            </Flex>
            <Container centerContent={true} maxW={'80%'} marginTop="20px">
                <TextArea
                    id="comments"
                    name="comments"
                    rows="4"
                    maxLength="1000"
                    placeholder={"Put your thoughts here..."}
                    onChange={e => onChange({ ...question, comment: e.target.value })}
                    value={question.comment}
                    required
                />
            </Container>
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
        comment: PropTypes.string,
        score: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]),
    }).isRequired,
    onChange: PropTypes.func,
  };

export default Question