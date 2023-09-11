import {
  Avatar, Box,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useStyle from '../hooks/useStyle';
import Text from './Text';
import Icon from './Icon';
import Link from './NextChakraLink';

function PublicProfile({ data }) {
  const { featuredColor, hexColor } = useStyle();

  const profile = data?.profile;

  const firstName = data?.first_name;
  const lastName = data?.last_name;
  const country = data?.country;
  const avatarImage = data?.profile?.avatar_url;
  const description = profile?.bio;
  const githubUsername = profile?.github_username;
  const twitterUsername = profile?.twitter_username;
  const linkedinLink = profile?.linkedin_url;
  const websiteLink = profile?.blog;
  const portfolioLink = profile?.portfolio_url;

  const fullName = `${firstName} ${lastName}`;
  const socialMedia = [
    {
      name: 'Github',
      icon: 'github',
      url: githubUsername ? `https://github.com/${githubUsername}` : null,
    },
    {
      name: 'Twitter',
      icon: 'twitter',
      url: twitterUsername ? `https://twitter.com/${twitterUsername}` : null,
    },
    {
      name: 'Linkedin',
      icon: 'linkedin',
      url: linkedinLink,
    },
    {
      name: 'Website',
      icon: 'globe',
      url: websiteLink || portfolioLink,
    },
  ];
  return (
    <Box display="flex" gridGap="24px" background={featuredColor} borderRadius="12px" padding="16px 24px">
      <Avatar
        width={{ base: '78px', md: '102px' }}
        height={{ base: '78px', md: '102px' }}
        name="Brent Solomon"
        src={avatarImage}
      />
      <Box display="flex" flexDirection="column" gridGap="6.5px">
        <Text size="26px" fontWeight={700} lineHeight="31.2px">
          {typeof data === 'string' ? data : fullName}
        </Text>
        {country && (
          <Text size="16px" fontWeight={400} color="blue.default" lineHeight="19.36px">
            {country}
          </Text>
        )}
        {description && (
          <Text size="12px" fontWeight={400}>
            {description}
          </Text>
        )}
        <Box display="flex" gridGap="16px" margin="20px 0 0 0">
          {socialMedia.filter((l) => typeof l.url === 'string').map((social) => (
            <Link key={`${social?.name}-${social?.url}`} href={social.url} target="_blank" rel="noopener noreferer" title={social.name}>
              <Icon icon={social.icon} width="20px" height="20px" color={hexColor.blueDefault} />
            </Link>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

PublicProfile.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
};
PublicProfile.defaultProps = {
  data: {
    first_name: 'Brent',
    last_name: 'Solomon',
    country: 'Buenos aires, Argentina',
    description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa...',
  },
};

export default PublicProfile;
