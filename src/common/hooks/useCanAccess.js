import useAuth from './useAuth';

/**
 * Hook to check if a user has access to a specific service
 * Returns a function that can be used to check access with different parameters
 * @returns {Function} - Function to check access for specific parameters
 */
const useCanAccess = () => {
  const { blockedServices } = useAuth();

  const checkAccess = ({ fromAcademy, fromCohort, fromMentorshipService }) => {
    // If blockedServices is null (still loading) or there are no blocked services, user has access
    if (!blockedServices || !blockedServices['mentorship-service']) {
      return { hasAccess: true };
    }

    const mentorshipService = blockedServices['mentorship-service'];

    // Check if service is blocked from everywhere
    const isBlockedEverywhere = mentorshipService.from_everywhere;

    // Check if service is blocked based on any of the provided slugs
    const isBlockedByAcademy = fromAcademy && Array.isArray(mentorshipService.from_academy)
      && mentorshipService.from_academy.includes(fromAcademy);

    const isBlockedByCohort = fromCohort && Array.isArray(mentorshipService.from_cohort)
      && mentorshipService.from_cohort.includes(fromCohort);

    const isBlockedByMentorshipService = fromMentorshipService && Array.isArray(mentorshipService.from_mentorship_service)
      && mentorshipService.from_mentorship_service.includes(fromMentorshipService);

    // Determine if user has access based on all conditions
    const hasAccess = !isBlockedEverywhere && !isBlockedByAcademy && !isBlockedByCohort && !isBlockedByMentorshipService;

    return {
      hasAccess,
      isBlockedEverywhere,
      isBlockedByAcademy,
      isBlockedByCohort,
      isBlockedByMentorshipService,
    };
  };

  return checkAccess;
};

export default useCanAccess;
