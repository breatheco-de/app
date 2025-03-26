import { useState, useMemo, useCallback, useEffect } from 'react';
import { WHITE_LABEL_ACADEMY, BREATHECODE_HOST } from '../../utils/variables';
import { parseQuerys } from '../../utils/url';

const coursesLimit = 1;

const useRecommendations = (endpoint, technologies, lang) => {
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);

  const headers = useMemo(() => ({
    'Accept-Language': lang,
  }), [lang]);

  const qs = useMemo(() => parseQuerys({
    academy: WHITE_LABEL_ACADEMY,
    featured: true,
  }), []);

  const technologiesArray = useMemo(() => {
    const technologiesList = technologies.map((tech) => tech?.slug || tech);
    return typeof technologiesList === 'string' ? technologiesList.split(',') : technologiesList;
  }, [technologies]);

  const fetchTutorials = useCallback(async () => {
    try {
      const response = await fetch(
        `${BREATHECODE_HOST}/v1/registry/asset?asset_type=EXERCISE&status=PUBLISHED&technologies=${technologiesArray.join(',')}`,
        { headers },
      );
      if (!response.ok) throw new Error(`Failed to fetch tutorials: ${response.statusText}`);
      return response.json();
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [technologiesArray, headers]);

  const filterMatchingTutorials = useCallback((tutorialsData) => tutorialsData.filter((tutorial) => {
    const matchingTechnologies = tutorial.technologies.filter((tech) => technologiesArray.includes(tech));
    return matchingTechnologies.length >= 2;
  }), [technologiesArray]);

  const sortAndSetRecommendations = useCallback((tutorials) => {
    const sortedTutorials = [...tutorials].sort((a, b) => {
      const aMatches = a.technologies.filter((tech) => technologiesArray.includes(tech)).length;
      const bMatches = b.technologies.filter((tech) => technologiesArray.includes(tech)).length;
      return bMatches - aMatches;
    });
    setRecommendations([sortedTutorials[0]]);
  }, [technologiesArray]);

  const gradeCourseBasedOnTech = useCallback((courses) => courses.map((course) => {
    const courseTechnologies = course.technologies.split(',');
    const techCount = courseTechnologies.length;
    const techsRelated = courseTechnologies.filter((tech) => technologiesArray.includes(tech));
    const relatedTechCount = techsRelated.length;
    const score = relatedTechCount * (1 / techCount);
    return { ...course, score, relatedTechCount };
  }), [technologiesArray]);

  const fetchAndSetCourses = useCallback(async () => {
    try {
      const response = await fetch(`${BREATHECODE_HOST}${endpoint}${qs}`, { headers });
      if (!response.ok) throw new Error(`Failed to fetch courses: ${response.statusText}`);

      const coursesData = await response.json();
      const coursesFiltered = coursesData?.filter((course) => course?.course_translation);

      if (coursesFiltered.length > 0) {
        const coursesGraded = gradeCourseBasedOnTech(coursesFiltered);
        const sortedCourses = coursesGraded.sort((a, b) => {
          if (b.relatedTechCount !== a.relatedTechCount) {
            return b.relatedTechCount - a.relatedTechCount;
          }
          return b.score - a.score;
        });

        setRecommendations(sortedCourses.slice(0, coursesLimit));
      }
    } catch (err) {
      setError(err);
    }
  }, [endpoint, qs, headers, gradeCourseBasedOnTech]);

  const fetchContent = useCallback(async () => {
    try {
      const tutorialsData = await fetchTutorials();
      const matchingTutorials = filterMatchingTutorials(tutorialsData);

      if (matchingTutorials.length > 1) {
        sortAndSetRecommendations(matchingTutorials);
      } else {
        await fetchAndSetCourses();
      }
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchTutorials, filterMatchingTutorials, sortAndSetRecommendations, fetchAndSetCourses]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetchContent();
  }, [lang, fetchContent]);

  return { isLoading, error, recommendations };
};

export default useRecommendations;
