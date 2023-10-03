import { BREATHECODE_HOST } from '../../utils/variables';

export const typeError = {
  common: 'common',
  phone: 'phone',
};
/**
 * @typedef {Object} Data Values from the form
 * @property {Number} status Status of the request
 * @property {String} silent_code Key error from the request
 * @property {String} error_type Language for the request
 */

/**
 * @param {Object} formValues Values from the form
 * @param {String} lang Language for the request
 * @returns {Promise<Data>} Data from the request
 */
export const startSignup = async (formValues, lang) => {
  try {
    const resp = await fetch(`${BREATHECODE_HOST}/v1/auth/subscribe/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': lang,
      },
      body: JSON.stringify(formValues),
    });
    const data = await resp.json();

    if (resp.status >= 400 && data?.phone) {
      return {
        ...data,
        error_type: 'phone',
      };
    }
    if (resp?.status >= 400) {
      return {
        ...data,
        error_type: 'common',
      };
    }

    return data;
  } catch (error) {
    console.error(error);
    return {
      error: true,
    };
  }
};
