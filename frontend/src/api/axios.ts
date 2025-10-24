import qs from 'qs';
import rootAxios from 'axios';

// Biến để đồng bộ hóa làm mới token
let isRefreshing = false;
let failedQueue = [] as any[];

const processQueue = <T>(error: T, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Tạo instance Axios
const axios = rootAxios.create({
  baseURL: '/api',
  timeout: 10000, // Timeout 10 giây
});

// Interceptor cho request
axios.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        // Kiểm tra token hợp lệ (có thể thêm logic kiểm tra JWT nếu cần)
        config.headers.Authorization = `Bearer ${token}`;
      } catch (e) {
        console.warn('Invalid token format:', e);
      }
    }

    // Cấu hình paramsSerializer
    config.paramsSerializer = {
      serialize: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
    };

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor cho response
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Kiểm tra lỗi 401 và chưa retry
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.skipAuth
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Thêm request vào queue nếu đang làm mới token
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const response = await axios.post(
          '/refetch-token',
          {},
          { withCredentials: true } // Bỏ qua auth cho refetch-token
        );

        const newToken = response.data?.accessToken;
        if (!newToken) {
          throw new Error('Invalid token response');
        }

        localStorage.setItem('accessToken', newToken);
        processQueue(null, newToken);

        // Cập nhật header cho request gốc
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Xử lý lỗi làm mới token (ví dụ: đăng xuất)
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('accessToken');
        // Có thể thêm logic chuyển hướng đến trang đăng nhập
        // window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);


export { axios };

