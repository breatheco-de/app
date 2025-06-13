import { useState, useEffect } from 'react';
import bc from '../services/breathecode';

const useConsumables = (cohorts = []) => {
  const [consumables, setConsumables] = useState({
    cohort_sets: [],
    event_type_sets: [],
    mentorship_service_sets: [],
    service_sets: [],
    voids: [],
  });
  const [services, setServices] = useState({
    mentorships: [],
    workshops: [],
    voids: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const getConsumables = async () => {
    try {
      const nonSaasCohorts = cohorts.filter((cohort) => !cohort.available_as_saas);
      const academies = [...new Set(nonSaasCohorts.map(({ academy }) => academy.id))];

      const allServices = {
        mentorships: [],
        workshops: [],
      };

      const cohortsServices = academies.map((academy) => bc.mentorship({ academy }, true).getService());
      const responseServices = await Promise.all(cohortsServices);
      const nonSaasServices = responseServices.flatMap(({ data }) => data).map((elem) => ({ ...elem, nonSaasAcademy: true }));

      const res = await bc.payment().service().consumable();
      if (res.status === 200) {
        const { data } = res;
        setConsumables(data);
        const promiseMentorship = data.mentorship_service_sets.map(async (elem) => {
          const mentRes = await bc.payment().getServiceSet(elem.id);
          return mentRes.data.mentorship_services.map((service) => ({ ...service, unit: elem.balance.unit }));
        });
        const promiseEvents = data.event_type_sets.map(async (elem) => {
          const evRes = await bc.payment().getEventTypeSet(elem.id);
          return evRes.data.event_types;
        });

        const promiseVoids = data.voids.map(async (elem) => {
          const voidRes = await bc.payment().getServiceInfo(elem.slug);
          const serviceData = voidRes.data[0];
          return {
            ...serviceData,
            name: serviceData.features[0]?.title || serviceData.service.title || '',
            description: serviceData.features[0]?.description || '',
            one_line_desc: serviceData.features[0]?.one_line_desc || '',
          };
        });

        const resMentorships = await Promise.all(promiseMentorship);
        const resWorkshops = await Promise.all(promiseEvents);
        const resVoids = await Promise.all(promiseVoids);

        allServices.mentorships = [...resMentorships.flat(), ...nonSaasServices];
        allServices.workshops = resWorkshops.flat();
        allServices.voids = resVoids.flat();
      }

      setServices(allServices);
      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getConsumables();
  }, [cohorts]);

  return {
    consumables,
    services,
    isLoading,
  };
};

export default useConsumables;
