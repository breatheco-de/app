/* eslint-disable camelcase */

export const generateUserContext = (user) => {
  const { first_name, last_name, date_joined, roles, settings } = user;
  let ai_context = '';
    
  if (first_name) ai_context += `The user's first name is ${first_name}. `;
  if (last_name) ai_context += `The user's last name is ${last_name}. `;
  if (date_joined) ai_context += `The user joined on ${date_joined}. `;
  if (roles) roles.forEach((role) => ai_context += `The user has the role of ${role.role} in the academy of ${role.academy.name}. `);
  if (settings) ai_context += `The user has the following settings: Default language: ${settings.lang}.`;

  return ai_context;
};
