/* eslint-disable max-len */
import * as Yup from 'yup';
import { phone, email, url } from '../../../utils/regex';

const subscribe = Yup.object().shape({
  email: Yup.string().matches(email, 'Invalid email').required('Email is required'),
});
const register = Yup.object().shape({
  first_name: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('First name is required'),
  last_name: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().matches(phone, 'Invalid phone number'),
  // password: Yup.string().required('Password is required'),
  // passwordConfirmation: Yup.string().required('Required').oneOf([Yup.ref('password'), null], 'Passwords must match'),
});

const invite = Yup.object().shape({
  first_name: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('First name is required'),
  last_name: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().matches(phone, 'Invalid phone number'),
  password: Yup.string().required('Password is required'),
  passwordConfirmation: Yup.string().required('Password Confirmation Required').oneOf([Yup.ref('password'), null], 'Passwords must match'),
});

const handleProfile = Yup.object().shape({
  first_name: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('First name is required'),
  last_name: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().matches(phone, 'Invalid phone number'),
});

const login = Yup.object().shape({
  password: Yup.string().required('Password is required'),
  email: Yup.string().email('Invalid email').required('Password is required'),
});

const leadForm = Yup.object().shape({
  full_name: Yup.string().min(10, 'Too Short!').max(50, 'Too Long!').required('Full name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
});

const projectUrlValidation = Yup.object().shape({
  githubUrl: Yup.string().matches(url, 'Invalid Url').required('Url is required'),
});

const signup = Yup.object().shape({
  firstName: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('First name is required'),
  lastName: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Last name is required'),
  // phone: Yup.string().matches(phone, 'Invalid phone number').required('Phone number is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  confirmEmail: Yup.string().oneOf([Yup.ref('email'), null], "Emails don't match").required('Confirm Email is required'),
});

export default {
  register,
  invite,
  handleProfile,
  login,
  leadForm,
  subscribe,
  projectUrlValidation,
  signup,
};
