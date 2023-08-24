import { Stack } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { memo, useEffect, useState } from 'react';
import DesktopItem from './DesktopItem';
import syllabusList from '../../../public/syllabus.json';

function DesktopNav({ NAV_ITEMS, extraContent, haveSession }) {
  const [privateItems, setPrivateItems] = useState([]);
  const readSyllabus = JSON.parse(syllabusList);
  const syllabusExists = readSyllabus.length > 0;

  useEffect(() => {
    if (haveSession && NAV_ITEMS?.length > 0) {
      setPrivateItems(NAV_ITEMS.filter((item) => item.private === true));
    }
  }, [haveSession, NAV_ITEMS]);

  const publicItems = NAV_ITEMS?.length > 0 ? NAV_ITEMS?.filter((item) => item.private !== true) : [];

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
          <DesktopItem key={publicItem.label} item={data} readSyllabus={syllabusExists ? readSyllabus : []} />
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
