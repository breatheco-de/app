import bc from '../services/breathecode';
import { error } from '../utils/logging';
import { processRelatedAssignments } from '../utils/cohorts';

/**
 * @param {Number | String} id Required id of the cohort
 * @returns {Promise<object>} Returns a cohort found
 */
export const getCohort = async (id) => {
  const { data } = await bc.admissions({ id }).cohorts();
  return data.find((cohort) => cohort?.id === id);
};

/**
 *  Generate Syllabus data using the id of the cohort
 *
 * @param {Number | String} id Required id of the cohort
 * @returns {Promise<object>} Returns a cohort found
 */
export const getCohortSyllabus = async (id) => {
  try {
    const cohortData = await getCohort(id);

    const syllabusSlug = cohortData?.syllabus_version?.slug;
    const syllabusVersion = cohortData?.syllabus_version?.version;

    const { data } = await bc.admissions().publicSyllabus(syllabusSlug, syllabusVersion);

    return {
      syllabus: data,
      cohort: cohortData || {},
    };
  } catch (reqErr) {
    error('getCohortSyllabus:', reqErr);
    return {};
  }
};

/**
 * @typedef {object} CohortAndSyllabusObj
 * @property {object} syllabus - Syllabus of the cohort
 * @property {object} cohort - Cohort data
 */
/**
 * @param {Number} id Cohort ID
 * @returns {Promise<CohortAndSyllabusObj>} Return the syllabus and cohort data
 */
export const generateCohortSyllabusModules = async (id) => {
  try {
    const cohortAndSyllabus = await getCohortSyllabus(id);

    const syllabusData = cohortAndSyllabus?.syllabus;
    const cohortSyllabusList = syllabusData.json?.days || syllabusData.json?.modules || [];

    const newModulesStruct = cohortSyllabusList.map((module) => {
      const relatedAssignments = processRelatedAssignments(module);

      const { content, filteredContent, filteredContentByPending } = relatedAssignments;
      return {
        id: module?.id,
        title: module?.label || '',
        description: module?.description || '',
        content,
        exists_activities: content?.length > 0,
        filteredContent,
        filteredContentByPending: content?.length > 0 ? filteredContentByPending : null,
        duration_in_days: module?.duration_in_days || null,
        teacherInstructions: module?.teacher_instructions || '',
        extendedInstructions: module.extended_instructions || '>:warning: No available instruction found for this module',
        keyConcepts: module['key-concepts'],
      };
    });

    return {
      syllabus: {
        ...syllabusData,
        modules: newModulesStruct,
      },
      cohort: cohortAndSyllabus?.cohort || {},
    };
  } catch (reqErr) {
    error('generateCohortSyllabusModules:', reqErr);
    return {};
  }
};

export const getStudents = async (slug, academyId, params = {}) => {
  try {
    const { data } = await bc.admissions(params).getStudents(slug, academyId);
    const sortedStudents = data.sort(
      (a, b) => a.user.first_name.localeCompare(b.user.first_name),
    );
    return sortedStudents;
  } catch (err) {
    return err;
  }
};

export const getAttendanceList = async ({ cohortSlug, academy }) => {
  try {
    const { data } = await bc.admissions({ academy }).getAttendance(cohortSlug);
    return data;
  } catch (err) {
    return err;
  }
};

export const saveCohortAttendancy = async ({ cohortSlug, students, checked, currentModule }) => {
  try {
    const attendanceIds = students.reduce((accumulator, { user }) => {
      const attended = checked.some((id) => parseInt(id, 10) === user.id);
      if (attended) {
        accumulator.attended.push(user.id);
      } else {
        accumulator.unattended.push(user.id);
      }
      return accumulator;
    }, { attended: [], unattended: [] });

    const dataStruct = {
      current_module: currentModule,
      teacher_comments: '',
      attendance_ids: attendanceIds.attended,
      unattendance_ids: attendanceIds.unattended,
    };

    const { data } = await bc.admissions().takeAttendance(
      cohortSlug,
      dataStruct,
    );
    return data;
  } catch (err) {
    return err;
  }
};
