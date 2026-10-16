import { Box, Button, Input, Select } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Text from '../../Text';
import useStyle from '../../../hooks/useStyle';

function AddSeatForm({
  onAdd, isDisabled, isSubmitting, eligibleCohorts,
}) {
  const { t } = useTranslation('profile');
  const { borderColor2 } = useStyle();
  const [email, setEmail] = useState('');
  const [cohortId, setCohortId] = useState('');

  useEffect(() => {
    if (eligibleCohorts.length === 1) {
      setCohortId(String(eligibleCohorts[0].id));
      return;
    }
    setCohortId((current) => (
      eligibleCohorts.some((cohort) => String(cohort.id) === current) ? current : ''
    ));
  }, [eligibleCohorts]);

  const noCohortsAvailable = eligibleCohorts.length === 0;
  const isFormDisabled = isDisabled || isSubmitting || noCohortsAvailable;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onAdd(email, Number(cohortId));
    if (success) {
      setEmail('');
      if (eligibleCohorts.length !== 1) {
        setCohortId('');
      }
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gridGap="10px">
      <Text fontSize="13px" fontWeight="600">
        {t('team-seats.add-seat-title')}
      </Text>
      {noCohortsAvailable ? (
        <Text fontSize="12px" color="gray.500">
          {t('team-seats.no-cohorts-available')}
        </Text>
      ) : (
        <>
          <Text fontSize="12px" fontWeight="600">
            {t('team-seats.cohort-label')}
          </Text>
          <Select
            value={cohortId}
            onChange={(e) => setCohortId(e.target.value)}
            borderColor={borderColor2}
            isDisabled={isFormDisabled}
          >
            {cohortId === '' && (
              <option value="" disabled hidden>
                {t('team-seats.select-cohort')}
              </option>
            )}
            {eligibleCohorts.map((cohort) => (
              <option key={cohort.id} value={cohort.id}>
                {cohort.name || cohort.slug}
              </option>
            ))}
          </Select>
          <Box display="flex" flexDirection={{ base: 'column', sm: 'row' }} gridGap="10px">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('team-seats.email-placeholder')}
              borderColor={borderColor2}
              isDisabled={isFormDisabled}
              flex="1"
            />
            <Button
              type="submit"
              variant="default"
              isDisabled={isFormDisabled || !email.trim() || !cohortId}
              isLoading={isSubmitting}
              minW={{ sm: '140px' }}
            >
              {t('team-seats.add-seat-button')}
            </Button>
          </Box>
        </>
      )}
      {isDisabled && (
        <Text fontSize="12px" color="gray.500">
          {t('team-seats.seats-limit-reached')}
        </Text>
      )}
    </Box>
  );
}

AddSeatForm.propTypes = {
  onAdd: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool,
  isSubmitting: PropTypes.bool,
  eligibleCohorts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    slug: PropTypes.string,
    name: PropTypes.string,
  })),
};

AddSeatForm.defaultProps = {
  isDisabled: false,
  isSubmitting: false,
  eligibleCohorts: [],
};

export default AddSeatForm;
