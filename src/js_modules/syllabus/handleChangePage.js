/* eslint-disable no-extra-boolean-cast */
const handleChangePage = (assignmentProps, {
  moduleProps, moduleTaskProps, setCurrentBlankProps, router, cohortSlug,
  setOpenNextModuleModal, setOpenTargetBlankModal,
}) => {
  if (assignmentProps !== null) {
    // router.push(`/syllabus/${cohortSlug}/${assignmentProps?.type?.toLowerCase()}/${assignmentProps?.slug}`);
    if (assignmentProps?.target === 'blank') {
      setCurrentBlankProps(assignmentProps);
      // setOpenTargetBlankModal(true);
      router.push(`/syllabus/${cohortSlug}/${assignmentProps?.type?.toLowerCase()}/${assignmentProps?.slug}`);
    } else {
      setCurrentBlankProps(null);
      router.push(`/syllabus/${cohortSlug}/${assignmentProps?.type?.toLowerCase()}/${assignmentProps?.slug}`);
    }
  } else if (!!(moduleProps)) {
    if (moduleTaskProps?.target !== 'blank') {
      if (cohortSlug && !!moduleTaskProps && !!moduleProps?.filteredContent[0]) {
        router.push(router.push(`/syllabus/${cohortSlug}/${moduleTaskProps?.type?.toLowerCase()}/${moduleTaskProps?.slug}`));
      } else {
        setOpenNextModuleModal(true);
      }
    } else {
      setCurrentBlankProps(moduleTaskProps);
      setOpenTargetBlankModal(true);
    }
  }
};

export default handleChangePage();
