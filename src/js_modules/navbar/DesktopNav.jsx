import { Stack } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import DesktopItem from './DesktopItem';
import syllabusList from '../../../public/syllabus.json';

const DesktopNav = ({ NAV_ITEMS, extraContent, haveSession }) => {
  const [privateItems, setPrivateItems] = useState([]);
  const readSyllabus = JSON.parse(syllabusList);

  useEffect(() => {
    if (haveSession) {
      setPrivateItems(NAV_ITEMS.filter((item) => item.private === true));
    }
  }, [haveSession, NAV_ITEMS]);

  const publicItems = NAV_ITEMS.filter((item) => item.private !== true);

  const customPublicItems = publicItems;
  const allItems = [...privateItems, ...customPublicItems];

  // manage submenus in level 1
  const prepareSubMenuData = (item) => {
    if (item.slug === 'social-and-live-learning') {
      return extraContent;
    }
    return item?.subMenu;
  };

  return (
    <Stack className="hideOverflowX__" direction="row" width="auto" spacing={4} alignItems="center">
      {customPublicItems.length > 0 && allItems.map((publicItem) => {
        const submenuData = prepareSubMenuData(publicItem);

        const data = {
          ...publicItem,
          subMenu: publicItem?.subMenu?.length > 1
            ? publicItem?.subMenu
            : submenuData,
        };

        return (
          <DesktopItem key={publicItem.label} item={data} readSyllabus={readSyllabus} />
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
  extraContent: PropTypes.arrayOf(PropTypes.object),
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

export default DesktopNav;
