import * as Yup from 'yup';

const register = Yup.object().shape({
  name: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Password is required'),
  passwordConfirmation: Yup.string().required('Required').oneOf([Yup.ref('password'), null], 'Passwords must match'),
});

const login = Yup.object().shape({
  password: Yup.string().required('Password is required'),
  email: Yup.string().email('Invalid email').required('Required'),
});

export default { register, login };
