const email = /^[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~])*@(?!mailinator|leonvero|ichkoch|naymeo|naymio)[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9][a-zA-Z0-9-]*)*\.[a-zA-Z]{2,}$/;
const phone = /^(?!(\d{2,})\1+)(?!(\d+)\2{3,})(\+\d{1,3})?(\d{8,10})$/;
const url = /((https?):\/\/)?(www.)?[a-z0-9]+(\.[com|io]{2,}){1,3}(#?\/[a-zA-Z0-9-_#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/;
const isGithubUrl = /((https?):\/\/)?(www.)?github+(\.[com|io]{2,}){1,3}(#?\/[a-zA-Z0-9-_#.]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/;

export {
  email, phone, url, isGithubUrl,
};
