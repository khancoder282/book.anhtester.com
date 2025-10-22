import { axios } from 'src/api/axios';

export const Category = {
  get: () => axios.get('/category-book').then((res) => res.data.list as Categories[]),
};
