import { axios } from 'src/api/axios';

import { toast } from 'src/components/toast';

export const getFolder = (path: string, search: string = ''): Promise<FileItem[]> =>
  axios
    .get('/file', {
      params: {
        path,
        search,
      },
    })
    .then((res) => res.data.list as FileItem[])
    .catch((res) => {
      toast.error(res.response.data.msg);
      throw res;
    });
