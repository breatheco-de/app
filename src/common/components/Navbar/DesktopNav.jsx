import { Stack } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import DesktopItem from './DesktopItem';

function DesktopNav({ navbarItems }) {
  return (
    <Stack className="hideOverflowX__" direction="row" width="auto" spacing={4} alignItems="center">
      {navbarItems.map((item) => (
        <DesktopItem key={item.label} item={item} readSyllabus={[]} />
      ))}
    </Stack>
  );
}

DesktopNav.propTypes = {
  navbarItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      description: PropTypes.string,
      icon: PropTypes.string,
      href: PropTypes.string,
      asPath: PropTypes.string,
      subMenu: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string,
          subLabel: PropTypes.string,
          href: PropTypes.string,
        }),
      ),
    }),
  ),
};

DesktopNav.defaultProps = {
  navbarItems: [
    {
      href: '/',
      description: '',
      icon: 'book',
      asPath: '/',
    },
  ],
};

export default DesktopNav;
