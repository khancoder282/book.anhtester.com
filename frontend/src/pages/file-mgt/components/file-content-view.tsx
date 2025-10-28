import { useDebounce } from 'minimal-shared/hooks';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import {
  Box,
  Link,
  Chip,
  Stack,
  Dialog,
  Button,
  Switch,
  Divider,
  Collapse,
  Typography,
  IconButton,
  Breadcrumbs,
  DialogTitle,
  ButtonGroup,
  DialogContent,
  DialogActions,
  OutlinedInput,
  InputAdornment,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';

import { useRequest } from 'src/hooks/use-request';

import { formatFilePath } from 'src/utils/format-filepath';

import { axios } from 'src/api/axios';
import { useAuth } from 'src/store/auth';

import { Iconify } from 'src/components/iconify';
import { useTable } from 'src/components/grid-view/hook/use-table';
import { ButtonDelete } from 'src/components/buttons/button-delete';
import { getIcon, formatSize } from 'src/components/fields/upload-field';
import { TableView } from 'src/components/grid-view/components/table-view';

import table from './style';
import { columns } from '../columns';
import { ViewType } from './view-type';
import { ActionFile } from './action-file';
import { getFolder } from '../api/get-folder';
import { DialogUpload } from './dialog-upload';
import { deleteFile } from '../api/delete-file';
import { useDialogUpload } from '../store/use-dialog-upload';

type FileContentViewProps = {
  root?: string;
  value?: FileItem[];
  onChange?: (path: FileItem[]) => void;
  isSmall?: boolean;
};

export default function FileContentView({
  root = '/',
  isSmall: defaultIsSmall = false,
  value,
  onChange,
}: FileContentViewProps) {
  const { auth } = useAuth();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState<number>(-1);
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [isSmall, setIsSmall] = useState<boolean>(defaultIsSmall);
  const _search = useDebounce(search, 650);
  const { setPath, path, rootPath, setRootPath } = useDialogUpload();

  useEffect(() => {
    if (root !== rootPath) {
      setRootPath(root);
      setPath(root);
    }
  }, [root, rootPath, setPath, setRootPath]);

  const {
    data: { list, info: { maxStorage, usedStorage } } = {
      list: [],
      info: { maxStorage: 1, usedStorage: 0 },
    },
    request,
  } = useRequest(
    useCallback(
      async () => ({
        list: await getFolder(path, _search),
        info: await axios.get('/file/info').then((res) => res.data),
      }),
      [path, _search]
    )
  );

  const { data: allFolder = [] } = useRequest(() =>
    getFolder('/', '*').then((r) => r.filter((f) => !f.isFile))
  );

  const percentStorage = (usedStorage / maxStorage) * 100;

  const config = useTable<FileItem>({
    rowsPerPage: 1,
    order: 'name',
    orderBy: 'asc',
  });

  const { list: _dataList, fileList: _fileList } = useMemo(() => {
    let _list = list;
    if (config.order) {
      _list = _list.sort((a, b) => {
        if (a[config.order!] < b[config.order!]) return config.orderBy === 'asc' ? -1 : 1;
        if (a[config.order!] > b[config.order!]) return config.orderBy === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return { list: _list, fileList: _list.filter((f) => f.isFile) };
  }, [config.order, config.orderBy, list]);

  const breadcrumbs = path.replace(rootPath, '').split('/').filter(Boolean);

  const fileList = useMemo(() => value?.filter((f) => f.isFile) ?? [], [value]);

  const file = useMemo(() => _fileList?.[index], [index, _fileList]);

  const lastClick = useRef<{ path: string; time: number } | null>(null);

  const onClickRow = useCallback(
    (row: FileItem) => {
      const now = Date.now();
      if (
        lastClick.current &&
        lastClick.current.path === row.path &&
        now - lastClick.current.time < 300
      ) {
        lastClick.current = null;
        if (row.isFile) {
          setOpen(true);
          setIndex(_fileList?.findIndex((f) => f.path === row.path) ?? -1);
        } else {
          setPath(row.path);
        }
        return;
      }
      lastClick.current = { path: row.path, time: now };
    },
    [_fileList, setPath]
  );

  useEffect(() => {
    if (!file && open) {
      setOpen(false);
    }
  }, [file, open]);

  useEffect(
    () => () => {
      setPath('/');
      setRootPath('/');
    },
    [setPath, setRootPath]
  );

  return (
    <>
      <Box p={3} display="flex" alignItems="center" flexWrap="wrap-reverse" gap={1}>
        <OutlinedInput
          fullWidth
          placeholder="Search file..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ maxWidth: 300 }}
          startAdornment={
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" />
            </InputAdornment>
          }
          endAdornment={
            search && (
              <InputAdornment position="end">
                <IconButton onClick={() => setSearch('')}>
                  <Iconify icon="mingcute:close-line" />
                </IconButton>
              </InputAdornment>
            )
          }
        />
        <FormControlLabel
          sx={{ ml: 'auto' }}
          checked={isPreview}
          onChange={(_, c) => setIsPreview(c)}
          control={<Switch />}
          label="Preview"
        />
        <FormControlLabel
          checked={isSmall}
          onChange={(_, c) => setIsSmall(c)}
          control={<Switch />}
          label="Small"
        />
        <Divider
          flexItem
          orientation="vertical"
          sx={{ mx: 2, display: { xs: 'none', md: 'block' } }}
        />
        <Box display="flex" gap={1}>
          <Box position="relative" display="flex" justifyContent="center" alignItems="center">
            <CircularProgress
              size={50}
              sx={{ color: 'divider' }}
              variant="determinate"
              value={100}
            />
            <CircularProgress
              size={50}
              sx={{ position: 'absolute' }}
              color={percentStorage > 80 ? 'error' : percentStorage > 50 ? 'warning' : 'success'}
              value={Math.max(percentStorage, 1)}
              defaultValue={0}
              variant="determinate"
            />
            <Typography position="absolute" variant="caption">
              {percentStorage.toFixed(1)}%
            </Typography>
          </Box>
          <Stack
            typography="caption"
            justifyContent="center"
            sx={{
              bgcolor: 'background.neutral',
              px: 2,
              py: 1,
              height: 56,
              width: 180,
              borderRadius: 1,
              '&>*': {
                flex: 1,
                display: 'flex',
                alignItems: 'center',
              },
              '&>*>*': {
                display: 'inline-block',
              },
            }}
          >
            <Box>
              <Box width={70} color="text.secondary">
                Used
              </Box>
              <Box flex={1} textAlign="end">
                {formatSize(usedStorage)}
              </Box>
            </Box>

            <Box>
              <Box width={70} color="text.secondary">
                Maximum
              </Box>
              <Box flex={1} textAlign="end">
                {formatSize(maxStorage)}
              </Box>
            </Box>
          </Stack>
        </Box>
      </Box>

      <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />

      {value && onChange && (
        <Collapse in={fileList.length > 0}>
          <Box
            sx={{
              border: 1,
              borderRadius: 2,
              display: 'flex',
              borderStyle: 'dashed',
              borderColor: 'divider',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1,
              mx: 3,
              mb: 1,
              p: 1,
            }}
          >
            {fileList.map((f) => (
              <Chip
                key={f.path}
                icon={<Box width={24} height={14} pl={0.5} component="img" src={getIcon(f.type)} />}
                label={f.name}
                onDelete={() => onChange(value.filter((i) => i.path !== f.path))}
              />
            ))}
            {fileList.length > 1 && (
              <Chip
                variant="outlined"
                color="default"
                label={`Unselect all (${fileList.length})`}
                onClick={() => onChange([])}
              />
            )}
          </Box>
        </Collapse>
      )}

      <Box px={3}>
        <Box sx={{ border: 1, borderRadius: 1, borderColor: 'divider' }}>
          <Breadcrumbs>
            <Button
              color="inherit"
              sx={{ minWidth: 'unset', borderRadius: 0.9 }}
              onClick={() => {
                setPath(rootPath);
                setSearch('');
              }}
            >
              <Iconify icon="solar:home-2-bold" />
            </Button>
            {breadcrumbs.map(
              (x, i) =>
                i !== breadcrumbs.length - 1 && (
                  <Link
                    onClick={() => setPath(breadcrumbs.slice(0, i + 1).join('/'))}
                    color="textDisabled"
                    key={x}
                    sx={{ cursor: 'pointer' }}
                  >
                    {x}
                  </Link>
                )
            )}
            <Typography color="textPrimary">{breadcrumbs[breadcrumbs.length - 1]}</Typography>
          </Breadcrumbs>
        </Box>
      </Box>

      <TableView
        size={isSmall ? 'small' : 'medium'}
        onClickRow={onClickRow}
        select={
          value &&
          onChange && {
            selected: value,
            setSelected: onChange,
          }
        }
        minWidth={400}
        sx={table(isSmall ? 'small' : 'medium')}
        columns={columns(isPreview)}
        data={_dataList.sort((a, b) => (a.isFile === b.isFile ? 0 : a.isFile ? 1 : -1))}
        config={config}
        keyName="path"
        renderAction={
          auth
            ? (row) =>
                row && (
                  <ActionFile
                    request={request}
                    row={row}
                    listFile={_dataList}
                    allFolder={allFolder}
                  />
                )
            : false
        }
      />
      <Dialog fullWidth maxWidth="sm" open={open}>
        <DialogTitle
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          Preview file
          <ButtonGroup color="inherit">
            <Button
              disabled={index === 0}
              sx={{ minWidth: 'unset', px: 1 }}
              onClick={() => setIndex(index - 1)}
            >
              <Iconify sx={{ transform: 'scaleX(-1)' }} icon="eva:arrow-ios-forward-fill" />
            </Button>
            <Button
              disabled={index === _fileList.length - 1}
              sx={{ minWidth: 'unset', px: 1 }}
              onClick={() => setIndex(index + 1)}
            >
              <Iconify icon="eva:arrow-ios-forward-fill" />
            </Button>
          </ButtonGroup>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            borderTopStyle: 'dashed',
            borderBottomStyle: 'dashed',
          }}
        >
          <ViewType file={file} />
        </DialogContent>
        <DialogActions>
          {!value && !onChange && auth && (
            <ButtonDelete
              sx={{ mr: 'auto' }}
              onDelete={() => deleteFile(file?.path ?? '').then(() => request())}
            />
          )}
          <Button color="inherit" onClick={() => setOpen(false)}>
            Close
          </Button>
          {!value && !onChange && (
            <Button
              href={formatFilePath(file?.path)}
              download={file?.name}
              startIcon={<Iconify icon="solar:cloud-download-bold" />}
              color="inherit"
              variant="contained"
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <DialogUpload reload={request} />
    </>
  );
}
