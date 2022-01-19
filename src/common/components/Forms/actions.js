/* eslint-disable no-unused-expressions */
/* eslint-disable no-return-assign */
import saveForm from '../../utils/leads';

export const defaultSession = {
  email: null,
};

export const processFormEntry = async (data) => {
  console.log('Form was sent successfully', data);

  const body = {};
  Object.keys(data).forEach((key) => key !== 'form_type' && (body[key] = data[key].value || data[key]));

  const tag = body.tag || 'request_downloadable';
  const automation = body.automation || 'downloadable';
  // if (!session || !session.utm || !session.utm.utm_test) {
  //   // eslint-disable-next-line no-return-await
  // }
  return saveForm(body, [tag.value || tag], [automation.value || automation]);
};
