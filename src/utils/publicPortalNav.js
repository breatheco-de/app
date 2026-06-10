const PUBLIC_PORTAL_NAV_LINKS = [
  { pattern: 'interactive-exercises', feature: 'interactive_exercises' },
  { pattern: 'interactive-coding-tutorials', feature: 'interactive_coding_tutorials' },
  { pattern: '/lessons', feature: 'lessons' },
  { pattern: '/technology', feature: 'technology' },
  { pattern: 'how-to', feature: null },
];

export const isPublicPortalNavLinkEnabled = (href, isFeatureEnabled) => {
  if (!href || typeof href !== 'string') return false;

  const normalizedHref = href.toLowerCase();
  const matchedRule = PUBLIC_PORTAL_NAV_LINKS.find(({ pattern }) => normalizedHref.includes(pattern));

  if (!matchedRule) return false;
  if (matchedRule.feature === null) return false;

  return isFeatureEnabled(`public_portal.${matchedRule.feature}.enabled`);
};

export const filterPublicPortalSubMenu = (subMenu, isFeatureEnabled) => {
  if (!Array.isArray(subMenu)) return [];

  const headerEntry = subMenu.find((entry) => entry.type === 'header');
  const filteredLinks = subMenu.filter((entry) => {
    if (entry.type === 'header') return false;
    return isPublicPortalNavLinkEnabled(entry.href, isFeatureEnabled);
  });

  if (filteredLinks.length === 0) return [];

  return headerEntry ? [headerEntry, ...filteredLinks] : filteredLinks;
};

export const buildWhiteLabelPublicPortalNavItem = (bootcampsItem, isFeatureEnabled) => {
  if (!isFeatureEnabled('public_portal.enabled')) return null;
  if (!bootcampsItem?.mainMenu) return null;

  const bootcampOptions = bootcampsItem.mainMenu.find((menuItem) => menuItem.id === 'bootcamp-options');
  const selfPacedSection = bootcampsItem.mainMenu.find((menuItem) => menuItem.id === 'self-paced-options');

  if (!bootcampOptions) return null;

  const filteredPublicPortalItems = selfPacedSection
    ? filterPublicPortalSubMenu(selfPacedSection.subMenu, isFeatureEnabled)
    : [];

  const bootcampSubMenu = Array.isArray(bootcampOptions.subMenu) ? [...bootcampOptions.subMenu] : [];
  const mergedSubMenu = filteredPublicPortalItems.length > 0
    ? [...bootcampSubMenu, ...filteredPublicPortalItems]
    : bootcampSubMenu;

  return {
    id: 'bootcamps',
    label: bootcampsItem.label,
    bgColor: bootcampsItem.bgColor,
    titleColor: bootcampsItem.titleColor,
    description: bootcampsItem.description,
    position: bootcampsItem.position ?? 1,
    mainMenu: [{
      ...bootcampOptions,
      subMenu: mergedSubMenu,
    }],
  };
};
