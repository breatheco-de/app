import { Stack } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import DesktopItem from './DesktopItem';

const DesktopNav = ({ NAV_ITEMS, haveSession }) => {
  const [privateItems, setPrivateItems] = useState([]);

  useEffect(() => {
    if (haveSession) {
      setPrivateItems(NAV_ITEMS.filter((item) => item.private === true));
    }
  }, [haveSession]);

  const publicItems = NAV_ITEMS.filter((item) => item.private !== true);

  return (
    <Stack direction="row" spacing={4} alignItems="center">
      {privateItems.length > 0 && privateItems.map((privateItem) => (
        <DesktopItem key={privateItem.label} item={privateItem} />
      ))}
      {publicItems.map((publicItem) => (
        <DesktopItem key={publicItem.label} item={publicItem} />
      ))}
    </Stack>
  );
};

DesktopNav.propTypes = {
  haveSession: PropTypes.bool.isRequired,
  NAV_ITEMS: PropTypes.arrayOf(
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
  NAV_ITEMS: [
    {
      href: '/',
      description: '',
      icon: 'book',
      asPath: '/',
    },
  ],
};

export default DesktopNav;
