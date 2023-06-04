import {
  Avatar, Box,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useStyle from '../hooks/useStyle';
import Text from './Text';
import Icon from './Icon';
import Link from './NextChakraLink';

function PublicProfile({ profile }) {
  const { featuredColor, hexColor } = useStyle();

  const { first_name: firstName, last_name: lastName, country, description } = profile;
  const fullName = `${firstName} ${lastName}`;
  const socialMedia = [
    {
      name: 'Github',
      icon: 'github',
      url: 'https://github.com',
    },
    {
      name: 'Twitter',
      icon: 'twitter',
      url: 'https://twitter.com',
    },
    {
      name: 'Linkedin',
      icon: 'linkedin',
      url: 'https://linkedin.com',
    },
    {
      name: 'Website',
      icon: 'globe',
      url: 'https://google.com',
    },
  ];
  return (
    <Box display="flex" gridGap="24px" background={featuredColor} borderRadius="12px" padding="16px 24px">
      <Avatar
        width={{ base: '78px', md: '102px' }}
        height={{ base: '78px', md: '102px' }}
        name="Brent Solomon"
        src="https://assets.breatheco.de/apis/img/images.php?blob&random&cat=icon&tags=brent,solomon"
      />
      <Box display="flex" flexDirection="column" gridGap="6.5px">
        <Text size="26px" fontWeight={700} lineHeight="31.2px">
          {fullName}
        </Text>
        <Text size="16px" fontWeight={400} color="blue.default" lineHeight="19.36px">
          {country}
        </Text>
        <Text size="12px" fontWeight={400}>
          {description}
        </Text>
        <Box display="flex" gridGap="16px" margin="20px 0 0 0">
          {socialMedia.map((social) => (
            <Link href={social.url} title={social.name}>
              <Icon icon={social.icon} width="20px" height="20px" color={hexColor.blueDefault} />
            </Link>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

PublicProfile.propTypes = {
  profile: PropTypes.shape({
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    country: PropTypes.string,
    description: PropTypes.string,
  }),
};
PublicProfile.defaultProps = {
  profile: {
    first_name: 'Brent',
    last_name: 'Solomon',
    country: 'Buenos aires, Argentina',
    description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa...',
  },
};

export default PublicProfile;
