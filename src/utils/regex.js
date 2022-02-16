const email = /^[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~])*@(?!mailinator|leonvero|ichkoch|naymeo|naymio)[a-zA-Z0-9]*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
const phone = /^(?!(\d{2,})\1+)(?!(\d+)\2{3,})(\+\d{1,3})?(\d{8,10})$/;

export {
  email,
  phone,
};
