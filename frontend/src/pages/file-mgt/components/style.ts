const table: (size: string) => Sx = (size) => ({
  px: 3,
  mb: 1,
  '& table': {
    borderSpacing: size === 'small' ? '0 8px' : '0 16px',
    borderCollapse: 'separate',
  },
  '& thead tr th:last-child': {
    overflow: 'hidden',
    borderRadius: (t) => t.spacing(0, 1.5, 1.5, 0),
  },
  '& thead tr th:first-of-type': {
    overflow: 'hidden',
    borderRadius: (t) => t.spacing(1.5, 0, 0, 1.5),
  },
  '& tbody tr': {
    userSelect: 'none',
    borderRadius: 1.5,
    transition: 'all .3s ease-in-out',
  },
  '& tbody tr td:not(.no-data)': {
    borderTop: 1,
    borderBottom: 1,
    borderColor: 'divider',
  },
  '& tbody tr td:first-of-type:not(.no-data)': {
    borderRadius: (t) => t.spacing(1.5, 0, 0, 1.5),
    borderLeft: 1,
    borderColor: 'divider',
  },
  '& tbody tr td:last-child:not(.no-data)': {
    borderRadius: (t) => t.spacing(0, 1.5, 1.5, 0),
    borderRight: 1,
    borderColor: 'divider',
  },
  '& tbody tr:hover:not(.no-data)': {
    cursor: 'pointer',
    boxShadow: (t) => t.customShadows.z20,
  },
});
export default table;
