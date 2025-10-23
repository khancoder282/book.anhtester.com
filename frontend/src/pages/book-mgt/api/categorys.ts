import { axios } from 'src/api/axios';


export const Category = {
  get: () => axios.get('/category-book').then((res) => res.data.list as Categories[]),
  create: (name: string) => axios.post('/category-book', { name }),
  update: (name: string, newName: string) => axios.put(`/category-book/`, { name, newName }),
  delete: (id: string) => axios.delete(`/category-book/${id}`),
};
