import qs from 'qs';
import rootAxios from 'axios';

const axios = rootAxios.create({
  baseURL: '/api',
});

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.paramsSerializer = {
      serialize: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config; // lưu request gốc

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // tránh vòng lặp vô hạn

      try {
        await axios.post('/refetch-token', {}, { withCredentials: true }).then((res) => {
          localStorage.setItem('accessToken', res.data.assessToken);
          originalRequest.headers['Authorization'] = `Bearer ${res.data.accessToken}`
        });

        // chạy lại request gốc với token mới
        return axios(originalRequest);
      } catch {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export { axios };
