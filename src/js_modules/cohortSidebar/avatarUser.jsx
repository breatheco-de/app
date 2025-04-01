import { memo } from 'react';
import {
  WrapItem,
  Avatar,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverArrow,
  PopoverBody,
  Box,
  useMediaQuery,
  AvatarBadge,
  useColorModeValue,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import Heading from '../../common/components/Heading';
import Text from '../../common/components/Text';
import useOnline from '../../common/hooks/useOnline';
import useCohortHandler from '../../common/hooks/useCohortHandler';

const AvatarUser = memo(({
  data, fullName, isTeacherVersion, containerStyle, width, height, badge, customBadge, isWrapped, index, withoutPopover, avatarUrl,
}) => {
  const { user } = data;
  const { t } = useTranslation('dashboard');
  const fullNameLabel = fullName || `${user?.first_name} ${user?.last_name}`;
  const router = useRouter();
  const { usersConnected } = useOnline();
  const { state } = useCohortHandler();
  const { cohortSession } = state;

  const isOnlineUser = usersConnected?.some((id) => id === user?.id);
  const [isBelowTablet] = useMediaQuery('(max-width: 768px)');
  const dateFormated = {
    en: data?.created_at && format(new Date(data?.created_at), 'MMMM dd, yyyy'),
    es: data?.created_at && format(new Date(data?.created_at), "dd 'de' MMMM, yyyy", { locale: es }),
  };
  const { cohortSlug } = router.query;

  const borderColor = useColorModeValue('white', 'featuredDark');

  const roles = {
    teacher: t('common:teacher'),
    assistant: t('common:assistant'),
    student: t('common:student'),
    member: t('common:member'),
  };

  const placementCard = isBelowTablet ? 'auto' : 'left-end';
  const avatar = user?.profile?.avatar_url || user?.github?.avatar_url || avatarUrl;

  return !withoutPopover ? (
    <Popover trigger="hover" key={fullNameLabel} placement={placementCard}>
      <PopoverTrigger>
        <WrapItem as="div" aria-expanded={false} justifyContent="center" alignItems="center" style={containerStyle}>
          <Avatar
            id={fullNameLabel}
            width={width}
            height={height}
            style={{ userSelect: 'none' }}
            onClick={() => {
              if (isTeacherVersion && user?.id && cohortSession?.academy?.id) {
                router.push(`/cohort/${cohortSlug}/student/${user?.id}?academy=${cohortSession.academy.id}`);
              }
            }}
            cursor={isTeacherVersion ? 'pointer' : 'default'}
            title={fullNameLabel}
            src={avatar}
            marginLeft={isWrapped ? '-10px' : '0px'}
            zIndex={index}
            alt={`${fullNameLabel} - image`}
          >
            {customBadge && (customBadge)}
            {badge && isOnlineUser && (
              <AvatarBadge
                boxSize="11px"
                bg="success"
                top="-4px"
                right={isWrapped ? '6px' : '4px'}
                border="2px solid"
                borderColor={borderColor}
              />
            )}
          </Avatar>
        </WrapItem>
      </PopoverTrigger>
      <PopoverContent minWidth={{ base: 'none', md: data?.role ? '320px' : '' }} width={data?.role ? '100%' : 'auto'} pr={!data?.role && '20px'}>
        {data?.role && (
          <PopoverHeader>
            <Heading
              size="15px"
              fontWeight="semibold"
              textTransform="uppercase"
              py="4px"
              px="8px"
              dangerouslySetInnerHTML={{
                __html: `${roles[data?.role?.toLowerCase()] || 'member'}`,
              }}
            />
          </PopoverHeader>
        )}
        <PopoverArrow />
        <PopoverBody className="popover-bg-color" display="flex" flexDirection="row" gridGap="15px" my="8px">
          <Avatar
            id={fullNameLabel}
            width={data?.role ? '95px' : '38px'}
            height={data?.role ? '95px' : '38px'}
            style={{ userSelect: 'none' }}
            src={avatar}
          />
          <Box display="flex" flexDirection="column" justifyContent="center" gridGap="10px" height="auto">
            <Heading size="15px">
              {fullNameLabel}
            </Heading>
            <Text size="sm" fontWeight="400">
              {`${t('dashboard:member-since', { role: roles[data?.role?.toLowerCase()] || 'member' })} ${dateFormated[router?.locale]}`}
            </Text>
          </Box>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  ) : (
    <WrapItem as="div" aria-expanded={false} justifyContent="center" alignItems="center" style={containerStyle}>
      <Avatar
        id={fullNameLabel}
        width={width}
        height={height}
        style={{ userSelect: 'none' }}
        onClick={() => {
          if (isTeacherVersion && user?.id && cohortSession?.academy?.id) {
            router.push(`/cohort/${cohortSlug}/student/${user?.id}?academy=${cohortSession.academy.id}`);
          }
        }}
        cursor={isTeacherVersion ? 'pointer' : 'default'}
        title={fullNameLabel}
        src={avatar}
        marginLeft={isWrapped ? '-10px' : '0px'}
        zIndex={index}
      >
        {customBadge && (customBadge)}
        {badge && isOnlineUser && (
          <AvatarBadge
            boxSize="11px"
            bg="success"
            top="-4px"
            right={isWrapped ? '6px' : '4px'}
            border="2px solid"
            borderColor={borderColor}
          />
        )}
      </Avatar>
    </WrapItem>
  );
});

AvatarUser.propTypes = {
  data: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])).isRequired,
  fullName: PropTypes.string,
  containerStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.any])),
  width: PropTypes.string,
  height: PropTypes.string,
  badge: PropTypes.bool,
  customBadge: PropTypes.node,
  isWrapped: PropTypes.bool,
  index: PropTypes.number,
  withoutPopover: PropTypes.bool,
  avatarUrl: PropTypes.string,
  isTeacherVersion: PropTypes.bool,
};
AvatarUser.defaultProps = {
  fullName: '',
  containerStyle: {},
  width: '39px',
  height: '39px',
  badge: false,
  customBadge: null,
  isWrapped: false,
  index: 0,
  withoutPopover: false,
  avatarUrl: '',
  isTeacherVersion: false,
};

export default AvatarUser;
