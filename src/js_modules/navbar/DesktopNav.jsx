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
  }, [haveSession]);

  const publicItems = NAV_ITEMS.filter((item) => item.private !== true);

  return (
    <Stack direction="row" spacing={4} alignItems="center">
      {privateItems.length > 0 && privateItems.map((privateItem) => (
        <DesktopItem key={privateItem.label} item={privateItem} />
      ))}
      {publicItems.map((publicItem) => {
        if (publicItem.asPath === '/read' && readSyllabus.length > 0) {
          // eslint-disable-next-line no-param-reassign
          publicItem.subMenu = readSyllabus?.map((el) => ({
            label: el.name,
            href: `/read/${el.slug}`,
          }));
        }
        return (
          <DesktopItem key={publicItem.label} item={publicItem} />
        );
      })}
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
