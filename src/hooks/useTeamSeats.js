import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import useTranslation from 'next-translate/useTranslation';
import useAuth from './useAuth';
import useSubscriptions from './useSubscriptions';
import useCustomToast from './useCustomToast';
import bc from '../services/breathecode';
import { isValidEmail } from '../utils';

export const PLAN_TYPE = {
  SUBSCRIPTION: 'subscription',
  PLAN_FINANCING: 'plan_financing',
};

export function getSharedServiceItems(planData) {
  const fromPlan = planData?.plans?.[0]?.service_items || [];
  const fromSubscription = planData?.service_items || [];
  const merged = [...fromSubscription, ...fromPlan];
  const seen = new Set();

  return merged.filter((item) => {
    if (!item?.id || item?.service?.type === 'SEAT') return false;
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function getEligibleCohortsForPlan(plan, ownerCohorts) {
  const planCohortSet = plan?.plans?.[0]?.cohort_set?.cohorts
    || plan?.selected_cohort_set?.cohorts
    || [];
  if (!planCohortSet.length || !ownerCohorts?.length) return [];
  const allowedIds = new Set(planCohortSet.map((cohort) => cohort.id));
  return ownerCohorts.filter((cohort) => allowedIds.has(cohort.id));
}

const useTeamSeats = () => {
  const { t } = useTranslation('profile');
  const { user, cohorts: ownerCohorts } = useAuth();
  const { state: subscriptionsState } = useSubscriptions();
  const { createToast } = useCustomToast({ toastId: 'team-seats-actions' });
  const [manageablePlans, setManageablePlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const basePlans = useMemo(() => {
    const data = subscriptionsState.subscriptions;
    if (!data) return [];
    const subs = (data.subscriptions || []).map((p) => ({ ...p, planType: PLAN_TYPE.SUBSCRIPTION }));
    const financings = (data.plan_financings || []).map((p) => ({ ...p, planType: PLAN_TYPE.PLAN_FINANCING }));
    return [...subs, ...financings].filter((p) => p.has_billing_team);
  }, [subscriptionsState.subscriptions]);

  const billingTeamPlanKey = useMemo(() => basePlans
    .map((p) => `${p.planType}-${p.id}`)
    .join(','), [basePlans]);

  const loadTeamData = useCallback(async (plans) => {
    if (!plans.length) {
      setManageablePlans((prev) => (prev.length === 0 ? prev : []));
      setIsLoading((prev) => (prev ? false : prev));
      return;
    }
    setIsLoading(true);
    try {
      const payment = bc.payment();
      const enriched = await Promise.all(plans.map(async (plan) => {
        let teamRes;
        let seatsRes;
        if (plan.planType === PLAN_TYPE.SUBSCRIPTION) {
          [teamRes, seatsRes] = await Promise.all([
            payment.getSubscriptionBillingTeam(plan.id),
            payment.getSubscriptionSeats(plan.id),
          ]);
        } else {
          [teamRes, seatsRes] = await Promise.all([
            payment.getPlanFinancingTeam(plan.id),
            payment.getPlanFinancingSeats(plan.id),
          ]);
        }
        return {
          ...plan,
          team: teamRes.data,
          seats: seatsRes.data || [],
          sharedServiceItems: getSharedServiceItems(plan),
        };
      }));
      setManageablePlans(enriched);
    } catch (error) {
      console.error('Error loading team seats:', error);
      createToast({
        title: t('team-seats.load-error'),
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [createToast, t]);

  useEffect(() => {
    if (!subscriptionsState.areSubscriptionsFetched) return;
    loadTeamData(basePlans);
  }, [subscriptionsState.areSubscriptionsFetched, billingTeamPlanKey]);

  const refresh = useCallback(() => loadTeamData(basePlans), [loadTeamData, basePlans]);

  const addSeat = async (plan, email, cohortId) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      createToast({
        title: t('team-seats.invalid-email'),
        status: 'warning',
        duration: 4000,
      });
      return false;
    }

    if (!cohortId) {
      createToast({
        title: t('team-seats.cohort-required'),
        status: 'warning',
        duration: 4000,
      });
      return false;
    }

    const payload = { add_seats: [{ email: normalizedEmail, cohort_id: cohortId }] };
    try {
      const payment = bc.payment();
      const res = plan.planType === PLAN_TYPE.SUBSCRIPTION
        ? await payment.updateSubscriptionSeats(plan.id, payload)
        : await payment.updatePlanFinancingSeats(plan.id, payload);

      const errors = res.data?.errors || [];
      if (errors.length > 0) {
        createToast({
          title: errors[0]?.message || t('team-seats.add-error'),
          status: 'error',
          duration: 5000,
        });
        return false;
      }

      const added = res.data?.data?.[0];
      createToast({
        title: added?.user ? t('team-seats.add-success') : t('team-seats.invite-sent'),
        status: 'success',
        duration: 5000,
      });
      await refresh();
      return true;
    } catch (error) {
      const detail = error?.response?.data?.detail;
      const message = typeof detail === 'string' ? detail : t('team-seats.add-error');
      createToast({
        title: message,
        status: 'error',
        duration: 5000,
      });
      return false;
    }
  };

  const removeSeat = async (plan, seatId) => {
    try {
      const payment = bc.payment();
      if (plan.planType === PLAN_TYPE.SUBSCRIPTION) {
        await payment.deleteSubscriptionSeat(plan.id, seatId);
      } else {
        await payment.deletePlanFinancingSeat(plan.id, seatId);
      }
      createToast({
        title: t('team-seats.remove-success'),
        status: 'success',
        duration: 4000,
      });
      await refresh();
      return true;
    } catch (error) {
      createToast({
        title: t('team-seats.remove-error'),
        status: 'error',
        duration: 5000,
      });
      return false;
    }
  };

  return {
    manageablePlans,
    isLoading,
    addSeat,
    removeSeat,
    refresh,
    getEligibleCohortsForPlan: (plan) => getEligibleCohortsForPlan(plan, ownerCohorts),
    hasManageableSeats: basePlans.length > 0,
    ownerEmail: user?.email?.toLowerCase(),
  };
};

export default useTeamSeats;
