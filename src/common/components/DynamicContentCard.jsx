import { Avatar, Box, Button, Divider, Flex, Heading } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import Icon from './Icon';
import Text from './Text';
import useStyle from '../hooks/useStyle';

function DynamicContentCard({ type, technologies }) {
  const { featuredColor, backgroundColor } = useStyle();

  return (
    <Flex flexDirection="column" padding="16px" gridGap="16px" minWidth="310px" maxWidth="410px" background={featuredColor} borderRadius="10px">
      <Flex alignItems="center" justifyContent="space-between" width="100%">
        {technologies?.length > 0 && (
        <Flex alignItems="center" gridGap="8px">
          {technologies.map((tech) => {
            if (type === 'workshop') {
              return (
                <Text alignItems="center" gridGap="4px" background={backgroundColor} padding="4px 10px" borderRadius="18px">
                  {tech.title}
                </Text>
              );
            }
            return (
              <Icon icon={tech?.icon} width="20px" height="20px" aria-label={tech.title} />
            );
          })}
        </Flex>
        )}
        <Flex gridGap="10px" alignItems="center">
          {/* tiempo de lectura */}
          <Flex alignItems="center" gridGap="4px" background={backgroundColor} padding="4px 8px" borderRadius="18px">
            <Icon icon="clock" width="14px" height="14px" />
            <Text>
              3 min read
            </Text>
          </Flex>
          {/* fecha de inicio */}
          {type === 'workshop' && (
          <Text>
            10/05/2023
          </Text>
          )}
        </Flex>
      </Flex>
      <Flex flexDirection="column" gridGap="16px">
        <Heading as="h2" size="18px">
          Intro to Professional and Agile Development
        </Heading>
        <Text size="14px">
          All you&apos;ve learned needs to be put together. Lets make our first entire professional application using the Agile Development method!
        </Text>
      </Flex>
      <Flex alignItems="center" justifyContent="space-between" gridGap="10px">
        <Flex>
          {type === 'workshop' && (
          <Flex alignItems="center" gridGap="12px">
            {/* host info */}
            <Avatar
              width="35px"
              height="35px"
              src="https://avatars.githubusercontent.com/u/56565994?s=80&u=1a37ab1666070d9c15fe877ff23f53539da23d05&v=4"
            />
            <Flex flexDirection="column" gridGap="8px">
              <Text size="14px" lineHeight="normal">
                By Tomas Gonzales
              </Text>
              <Text fontSize="12px" lineHeight="normal">
                Software Developer @4Geeks Academy
              </Text>
            </Flex>
          </Flex>
          )}
          {type === 'project' && (
          <Text size="13px" color="red" padding="5px 7px" borderRadius="18px" background="red.light">
            Advanced
          </Text>
          )}
        </Flex>
        <Flex margin="0 0 0 auto" gridGap="8px" alignItems="center">
          {type === 'workshop' ? (
            <Flex alignItems="center" gridGap="8px" background={backgroundColor} padding="4px 10px" borderRadius="18px">
              <Text size="12px" textTransform="uppercase">
                eng
              </Text>
              <Icon icon="usaFlag" width="15px" height="15px" />
            </Flex>
          ) : (
            <>
              {type === 'project' && (
              <>
                {/* si es interactivo */}
                <Icon icon="rigobot-avatar-tiny" width="18px" height="18px" />
                {/* must show if has gitpod? */}
                <Icon icon="learnpack" width="18px" height="18px" />
                {/* condicionar si tiene codigo de solucion */}
                <Icon icon="download" color="currentColor" width="18px" height="14px" />
              </>
              )}
              {/* must show if has video */}
              <Icon icon="tv-live" width="18px" height="18px" />
            </>
          )}
        </Flex>
      </Flex>

      <Box>
        <Divider mb="8px" />
        {type === 'workshop' ? (
          <Button variant="link" fontSize="17px" width="100%">
            Register to this workshop
          </Button>
        ) : (
          <Flex gridGap="8px">
            <Text size="12px">
              +12 students worked in this file
            </Text>
          </Flex>
        )}
      </Box>
    </Flex>
  );
}

DynamicContentCard.propTypes = {
  type: PropTypes.string.isRequired,
  technologies: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
    icon: PropTypes.string,
  })).isRequired,
};

export default DynamicContentCard;
