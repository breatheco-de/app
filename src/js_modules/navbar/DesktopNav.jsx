import { Stack } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { memo, useEffect, useState } from 'react';
import DesktopItem from './DesktopItem';

function DesktopNav({ NAV_ITEMS, extraContent, haveSession }) {
  const [privateItems, setPrivateItems] = useState([]);

  useEffect(() => {
    const hasNavItems = NAV_ITEMS?.length > 0;

    if (haveSession && hasNavItems) {
      setPrivateItems(NAV_ITEMS.filter((item) => item.private === true));
    }
  }, [haveSession, NAV_ITEMS]);

  const publicItems = NAV_ITEMS?.filter((item) => !item.private) || [];
  const allItems = [...privateItems, ...publicItems].sort((a, b) => a.position - b.position);

  const prepareSubMenuData = (item) => {
    if (item.id === 'bootcamps') {
      return extraContent;
    }
    return item?.subMenu;
  };

  return (
    <Stack className="hideOverflowX__" direction="row" width="auto" spacing={4} alignItems="center">
      {allItems.map((publicItem) => {
        const submenuData = prepareSubMenuData(publicItem);
        const subMenuLength = publicItem?.subMenu?.length || 0;

        const data = {
          ...publicItem,
          subMenu: subMenuLength > 1 ? publicItem.subMenu : submenuData,
        };

        return (
          <DesktopItem key={publicItem.label} item={data} readSyllabus={[]} />
        );
      })}
    </Stack>
  );
}

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
  extraContent: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
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
  extraContent: [],
};

export default memo(DesktopNav);
