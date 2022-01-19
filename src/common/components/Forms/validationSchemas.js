import * as Yup from 'yup';

const register = Yup.object().shape({
  name: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
  passwordConfirmation: Yup.string().required('Required').oneOf([Yup.ref('password'), null], 'Passwords must match'),
});

const login = Yup.object().shape({
  password: Yup.string().required('Password is required'),
  email: Yup.string().email('Invalid email').required('Required'),
});

const leadForm = Yup.object().shape({
  full_name: Yup.string().min(10, 'Too Short!').max(50, 'Too Long!').required('Full name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
});
export default { register, login, leadForm };
