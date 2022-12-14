/* eslint-disable no-unused-vars */
import React from 'react';
import {
  Box, useMediaQuery,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import axios from '../../axios';
import Icon from '../../common/components/Icon';
import Text from '../../common/components/Text';
import Module from '../../common/components/Module';
import { usePersistent } from '../../common/hooks/usePersistent';
import useStyle from '../../common/hooks/useStyle';
import Heading from '../../common/components/Heading';
import handlers from '../../common/handlers';

function CohortProgram({ item, handleChoose }) {
  const { t } = useTranslation('choose-program');
  const [isMobile] = useMediaQuery('(min-width: 600px)');
  const [cohortSession, setCohortSession] = usePersistent('cohortSession', {});
  const { borderColorStrong } = useStyle();
  const router = useRouter();

  const { cohort } = item;
  const { version, slug, name } = cohort.syllabus_version;

  const roleIcon = {
    teacher: 'teacher1',
    assistant: 'idea',
    student: 'student',
  };
  const roleLabel = {
    teacher: t('common:teacher'),
    assistant: t('common:assistant'),
    student: t('common:student'),
    reviewer: t('common:reviewer'),
  };

  const onClickHandler = () => {
    handleChoose({
      version,
      slug,
      cohort_name: cohort.name,
      cohort_slug: cohort?.slug,
      syllabus_name: name,
      academy_id: cohort.academy.id,
    });

    axios.defaults.headers.common.Academy = cohort.academy.id;
    setCohortSession({
      ...cohort,
      ...cohortSession,
      selectedProgramSlug: `/cohort/${cohort?.slug}/${slug}/v${version}`,
    });
    router.push(`/cohort/${cohort?.slug}/${slug}/v${version}`);
  };

  const formatToLocale = (date) => {
    new Date(date)
      .toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
  };
  const formatedTime = handlers.formatTimeString(new Date(cohort.kickoff_date)).duration;
  // const hasStarted = handlers.checkIfExpired(new Date(cohort.kickoff_date));
  const hasExpired = handlers.checkIfExpired({ date: new Date(cohort.ending_date) });
  console.log('item:::', item);
  console.log('hasExpired:::', hasExpired);

  return (
    <Box borderRadius="9px" border="1px solid" borderColor={borderColorStrong} minHeight="150px" position="relative" padding="0 14px">
      <Box padding="12px 12px" backgroundColor="blue.default" borderRadius="50%" position=" absolute" top={-6} left={4}>
        <Icon icon="coding" width="24px" height="24px" style={{ margin: 'auto 0' }} />
      </Box>

      <Box display="flex" justifyContent="flex-end">
        {!hasExpired.value && (
          <>
            Expires in:
            <br />
            {hasExpired.date}

          </>
        )}
      </Box>
      <Box margin="2rem 0 0 0">
        <Heading size="16px">
          {cohort.name}
        </Heading>
      </Box>

      {/* <Module
        onClickHandler={onClickHandler}
        containerPX="24px"
        data={{
          iconProp: {
            tooltip: roleLabel[item.role.toLowerCase()],
            icon: roleIcon[item.role.toLowerCase() || 'user'],
            color: '#0097CF',
            width: '26px',
            height: '26px',
            style: {
              marginRight: '20px',
            },
          },
          type: name,
          title: `Cohort: ${cohort.name}`,
        }}
        leftContentStyle={{
          maxWidth: !isMobile ? '135px' : 'auto',
        }}
        rightItemHandler={(
          <Box
            width="100%"
            onClick={() => onClickHandler()}
            display="flex"
            justifyContent="flex-end"
            _focus={{ boxShadow: 'none' }}
            cursor="pointer"
          >
            <Text
              size="l"
              margin="0px"
              width="max-content"
              color="blue.400"
              fontWeight="800"
              justifyContent="center"
              alignSelf="center"
              marginRight="15px"
            >
              {isMobile ? t('launch-program') : ''}
            </Text>
            <Icon
              color="#0097CD"
              icon="longArrowRight"
              width="22px"
              height="11"
              style={{ margin: 'auto 0' }}
            />
          </Box>
        )}
      /> */}
    </Box>
  );
}

CohortProgram.propTypes = {
  item: PropTypes.objectOf(PropTypes.any),
  handleChoose: PropTypes.func,
};
CohortProgram.defaultProps = {
  item: {},
  handleChoose: () => {},
};

export default CohortProgram;
