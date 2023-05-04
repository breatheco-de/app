/* eslint-disable no-param-reassign */
import { Stack } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import DesktopItem from './DesktopItem';

const DesktopNav = ({ NAV_ITEMS, readSyllabus, haveSession }) => {
  const [privateItems, setPrivateItems] = useState([]);

  useEffect(() => {
    if (haveSession) {
      setPrivateItems(NAV_ITEMS.filter((item) => item.private === true));
    }
  }, [haveSession, NAV_ITEMS]);

  const publicItems = NAV_ITEMS.filter((item) => item.private !== true);

  const customPublicItems = publicItems.map((publicItem) => {
    if (publicItem.asPath === '/read' && readSyllabus.length > 0 && Array.isArray(publicItem.subMenu)) {
      publicItem.subMenu.map((l) => {
        if (typeof l.asPath === 'string' && l.asPath === '/read-and-watch' && Array.isArray(l.subMenuContent)) {
          const courseFetched = readSyllabus;

          l.subMenu = l?.subMenu || [];
          l.subMenu = [...courseFetched, ...l.subMenuContent];

          return l;
        }
        return l;
      });
    }
    return publicItem;
  });

  return (
    <Stack className="hideOverflowX__" direction="row" width="auto" spacing={4} alignItems="center">
      {privateItems.length > 0 && privateItems.map((privateItem) => (
        <DesktopItem key={privateItem.label} item={privateItem} />
      ))}
      {customPublicItems.length > 0 && customPublicItems.map((publicItem) => (
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
  readSyllabus: PropTypes.arrayOf(PropTypes.any),
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
  readSyllabus: [],
};

export default DesktopNav;
