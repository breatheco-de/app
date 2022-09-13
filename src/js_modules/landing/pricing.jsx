import PropTypes from 'prop-types';
import { Box, Button, useColorModeValue } from '@chakra-ui/react';
import Plx from 'react-plx';
import { useRouter } from 'next/router';
import Heading from '../../common/components/Heading';
import Icon from '../../common/components/Icon';
import { parallax5 } from '../../lib/landing-props';

const Pricing = ({ data }) => {
  const router = useRouter();
  const featuredBg = useColorModeValue('featuredLight', 'featuredDark');

  return (
    <Box display="flex" flexDirection="column" justifyContent="center" py="20px" height="100%" alignItems="center" gridGap={51} mt="16px">
      <Heading>
        {data?.pricing?.title}
      </Heading>
      <Plx parallaxData={parallax5}>
        <Box maxW="container.xl" display="flex" flexDirection="column" alignItems={{ base: 'center', md: 'start' }} gridGap="21px">
          {data?.pricing?.list.filter((l) => l.show === true).map((item) => (
            <Box key={item.title} display="flex" flexDirection={{ base: 'column', md: 'row' }} width={{ base: '100%', md: '700px' }} justifyContent="space-between" p="23px" borderRadius="16px" gridGap="24px">
              <Box display="flex" flexDirection="column" minWidth={{ base: '100%', md: '288px' }} p="16px 25px" height="fit-content" fontWeight="400" background={featuredBg} borderRadius="16px">
                <Box fontSize="18px" fontWeight="700" mb="6px">
                  {data?.title}
                </Box>
                <Box display="flex" alignItems="flex-end" gridGap="10px">
                  <Heading as="span" size={item?.type === 'basic' ? 'm' : 'xl'} lineHeight="1" color={item?.type === 'basic' ? '' : 'green.500'}>
                    {item?.price}
                  </Heading>
                  {item?.type !== 'basic' && (
                    <Heading as="span" size="sm" mb="8px" dangerouslySetInnerHTML={{ __html: item?.lastPrice }} />
                  )}
                </Box>
                {item?.offerTitle && (
                  <Box fontSize="12px" color="white" fontWeight="500" textTransform="uppercase" background="green.500" p="6px 12px" borderRadius="12px" width="fit-content" m="22px 0 0 0">
                    {item?.offerTitle}
                  </Box>
                )}

                {item?.description && (
                  <Box fontSize="13px" textTransform="uppercase" fontWeight="700" mt="16px">
                    {item.description}
                  </Box>
                )}
                {item?.highlightText && (
                  <Box fontSize="12px" color="blue.default" textTransform="uppercase" width="fit-content" borderRadius="12px" fontWeight="500" mt="16px" p="6px 12px" background="white">
                    {item.highlightText}
                  </Box>
                )}
                <Box mt="14px">
                  <Button variant="default" onClick={() => router.push(item?.button?.link)}>
                    {item?.button?.title}
                  </Button>
                </Box>
              </Box>
              <Box display="flex" flexDirection="column" w="100%" gridGap="10px">
                {item?.bullets?.description && (
                  <Box
                    fontSize="14px"
                    fontWeight="500"
                    dangerouslySetInnerHTML={{ __html: item?.bullets?.description }}
                  />
                )}
                <Box fontSize="13px" textTransform="uppercase" fontWeight="700" color="blue.default">
                  {item?.bullets?.title}
                </Box>
                <Box as="ul" style={{ listStyle: 'none' }} display="flex" flexDirection="column" gridGap="12px">
                  {item?.bullets?.list.map((bullet) => (
                    <Box as="li" key={bullet?.title} display="flex" flexDirection="row" lineHeight="24px" gridGap="6px">
                      <Icon icon="checked2" color="#38A56A" width="12px" height="9px" style={{ margin: '8px 0 0 0' }} />
                      <Box
                        fontSize="14px"
                        fontWeight="600"
                        letterSpacing="0.05em"
                        dangerouslySetInnerHTML={{ __html: bullet?.title }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          ))}

        </Box>
      </Plx>
    </Box>
  );
};

Pricing.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default Pricing;
