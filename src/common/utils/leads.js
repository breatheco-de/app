/**
 *
 * @param {Information to send to the backend} formData
 * @param {Any tag from active campaign} tags
 * @param {hard, soft, newsletter, etc} automations
 * @param {session information object} session
 */
const saveForm = async (formData = null, tags = [], automations = []) => {
  if (!Array.isArray(tags)) throw Error('Tags must be an array');
  if (typeof (formData) !== 'object') throw Error('Missing formData');

  console.log('formData', formData);
  const resp = await fetch(`${process.env.BREATHECODE_HOST}/v1/marketing/lead`, {
    headers: new Headers({ 'content-type': 'application/json' }),
    method: 'POST',
    body: JSON.stringify({
      ...formData,
      tags: tags.join(','),
      automations: automations.join(','),
    }),
  });

  if (resp.status >= 200 && resp.status < 400) {
    return resp.json();
  }

  const error = await resp.json();
  if (typeof (error.detail) === 'string') throw Error(error.detail);
  if (typeof (error.details) === 'string') throw Error(error.details);

  Object.keys(error).forEach((key) => {
    throw Error(`${error[key][0]} ${key}`);
  });
  return console.log('Running SaveForm', saveForm);
};

export default saveForm;
