import React, { useEffect,useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import quoteImg from '../../img/quote.png';
import whiteQuoteImg from '../../img/white-quote.png';

const Quote = ({ children, ...props }) => {
const [version,setVersion] = useState(4)
  const { id, ...rest } = props;

  const quote = children.split('--');

//  useEffect(()=>{
//   setVersion(Math.floor(Math.random() * 4 ) + 1)
//   console.log(version)
//  },[])
 
  if( version == 1) {
    return (
      <Flex justifyContent="center" alignItems="center" >
            <Box {...rest} className="quote-container" display="flex" alignContent="center" width="43%">
              <Box className="quote-img" bg="#EEF9FE" width="25.7%" mr="3"  padding="9px">
                <img src={quoteImg.src} alt="quoteImg" />
              </Box>
              <Box className="quote-content">
                      <Box className="quote-paragraph">
                        {quote[0]}
                        &quot;
                      </Box>
                      <Box className="quote-author" fontSize="xs" margin="1.5%" color="#0097CF">
                        --
                        {quote[1]}
                      </Box>
              </Box>
            </Box>  
          </Flex>
    );
  }
  else if( version  == 2){
    return (      
          <Flex justifyContent="center" alignItems="center" flexDirection="column">
            <Box {...rest} className="quote-container" display="flex" flexDirection="column" alignContent="center" width="43%">
              <Box className="quote-img" width="3.5%" mr="5" mb="3">
                <img src={quoteImg.src} alt="quoteImg" />
              </Box>
              <Box className="quote-content">
                      <Box className="quote-paragraph">
                        {quote[0]}
                        &quot;
                      </Box>
                      <Box className="quote-author" fontSize="xs" margin="1.5%" color="#0097CF">
                        --
                        {quote[1]}
                      </Box>
              </Box>
            </Box>  
          </Flex>
    );
  }
  else if( version == 3){
    let splitP = quote[0].split(".")
    return (
      <Flex justifyContent="center" alignItems="center" flexDirection="column">
      <Box {...rest} className="quote-container" display="flex" flexDirection="column" alignContent="center" width="47%">
        <Box className="quote-img" width="3.5%" mr="5" mb="3">
          <img src={quoteImg.src} alt="quoteImg" />
        </Box>
        <Box className="quote-content">
        <Box className="quote-paragraph-container">
          
                <Box className="quote-paragraph">
                  {splitP[0].split(" ").map((item,index)=>{
                  
                  return(
                  <span key={index} style={{backgroundColor:"#0097CF", marginRight:"3px", padding: "0px 1px 2px 3px", color:"white"}}>
                  {index == splitP[0].split(" ").length - 1 ? item + "." + " " : item + " "}
                  </span>
                  );
                  })
                  }
                {splitP[1]}
                  &quot;
                </Box>
          </Box>
                <Box className="quote-author" fontSize="xs" margin="1.5%" color="#0097CF">
                  --
                  {quote[1]}
                </Box>
        </Box>
      </Box>  
    </Flex>
    );
  }
  else if( version == 4){
    return (
      <Flex justifyContent="center" alignItems="center" flexDirection="column">
            <Box {...rest} className="quote-container" display="flex" flexDirection="column" alignContent="center" width="44%">
              <Box className="quote-img" width="5.5%" bg="#0097CF" p="5px" mr="5" mb="2">
                <img src={whiteQuoteImg.src} alt="quoteImg" />
              </Box>
              <Box className="quote-content">
                      <Box className="quote-paragraph">
                        {quote[0]}
                        &quot;
                      </Box>
                      <Box className="quote-author" fontSize="xs" margin="1.5%" color="#0097CF">
                        --
                        {quote[1]}
                      </Box>
              </Box>
            </Box>  
          </Flex>
    );
  }
  
  
};
Quote.propTypes = {
  children: PropTypes.node,
  id: PropTypes.string,
};
Quote.defaultProps = {
  children: '',
  id: '',
};
export default Quote;
