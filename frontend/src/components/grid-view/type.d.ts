

type Columns<T> = {
  label: string;
  sort?: keyof T;
  type?: 'string' | 'number' | 'date' | 'boolean';
  sx?: Sx;
  render: (row: T) => React.ReactNode;
};

type Fields = {
  mode: 'AND' | 'OR';
  fields: {
    key: string;
    value: string | Dayjs;
    operator: string;
  }[];
  _isFilter: boolean;
};

type FieldType<T> =
  | {
    name: keyof T;
    label: string;
    type: 'string' | 'number' | 'date' | 'boolean';
    options?: never;
  }
  | {
    name: keyof T;
    label: string;
    type: 'enums';
    options: string[];
  };
