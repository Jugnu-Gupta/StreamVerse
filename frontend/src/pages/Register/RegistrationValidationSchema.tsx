import * as yup from 'yup';

export const RegistrationValidationSchema = yup.object({
    email: yup.string().email('Invalid email address').required('Please enter your email'),
    password: yup.string().min(6).required('Please enter your password'),
    confirmPassword: yup.string().oneOf([yup.ref('password'), undefined], 'Passwords must match')
});