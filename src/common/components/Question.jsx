import { useState, useEffect } from 'react';
import {
  Heading, Container, Button, Flex, Center,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import TextArea from '../styledComponents/TextArea';

const options = {
  desktop: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  mobile: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
};

const Question = ({ question, onChange }) => {
  const { t } = useTranslation('survey');
  const [focused, setFocused] = useState(-1);
  useEffect(() => {
    if (parseInt(question.score, 10)) setFocused(question.score - 1);
  }, question.score);
  return (
    <Container marginTop="40px" width="80%" maxW="none" padding="0">
      <Container centerContent maxW="none">
        <Heading textAlign="center">{question.message}</Heading>
      </Container>
      <Flex justify="center" marginTop="40px" maxW="none">
        <Center>
          {question.lowest}
        </Center>
        <div className="" style={{ maxWidth: '570px', margin: '0 20px' }}>
          {
                        options.desktop.map((number, index) => (
                          <Button
                            marginLeft="5px"
                            marginRight="5px"
                            colorScheme={focused >= index ? 'messenger' : 'gray'}
                            onClick={() => {
                              setFocused(number - 1);
                              onChange({ ...question, score: number });
                            }}
                          >
                            {number}
                          </Button>
                        ))
                    }
        </div>
        <Center>
          {question.highest}
        </Center>
      </Flex>
      <Container centerContent marginTop="20px" marginBottom="10px" maxW="none" padding="0" background="inherit">
        <TextArea
          id="comments"
          name="comments"
          rows="4"
          maxLength="1000"
          placeholder={t('thoughts')}
          onChange={(e) => onChange({ ...question, comment: e.target.value })}
          value={question.comment}
          required
        />
      </Container>
    </Container>
  );
};

Question.defaultProps = {
  onChange: () => {},
};

Question.propTypes = {
  question: PropTypes.shape({
    lowest: PropTypes.string,
    highest: PropTypes.string,
    message: PropTypes.string,
    comment: PropTypes.string,
    score: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
  }).isRequired,
  onChange: PropTypes.func,
};

export default Question;
