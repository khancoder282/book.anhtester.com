// Namespace 'auth'. Khoá tiếng Anh là nguồn: thêm khoá ở đây trước, rồi thêm bản dịch ở vi/auth.ts.
// Màn sign-in, sign-up. Form thông tin user trong sign-up dùng namespace 'user'.
export const auth = {
  signIn: {
    title: 'Sign in',
    noAccount: 'Don’t have an account?',
    getStarted: 'Get started',
    emailLabel: 'Email address',
    passwordLabel: 'Password',
    submit: 'Login account',
  },
  signUp: {
    title: 'Sign up',
    haveAccount: 'Already have an account?',
    signInLink: 'Sign in',
    submit: 'Register',
  },
  validation: {
    emailInvalid: 'Invalid email address',
    emailRequired: 'Email is required.',
    emailMaxLength: 'Email maximum length is 191 characters.',
    passwordRequired: 'Password is required.',
    passwordMaxLength: 'Password maximum length is 250 characters.',
  },
  toast: {
    networkError: 'Cannot connect to the server. Please try again.',
  },
};
