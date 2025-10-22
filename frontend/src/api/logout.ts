import { axios } from './axios';

export const hanldeLogout = () =>
  axios.delete('/logout').then(() => {
    localStorage.removeItem('accessToken');
  });
