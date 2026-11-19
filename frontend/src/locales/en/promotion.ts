// Namespace 'promotion'. Khoá tiếng Anh là nguồn: thêm khoá ở đây trước, rồi thêm bản dịch ở vi/promotion.ts.
export const promotion = {
  status: {
    label: 'Status',
    disabled: 'Disabled',
    scheduled: 'Scheduled',
    running: 'Running',
    expired: 'Expired',
  },
  type: {
    PERCENTAGE: 'Percentage',
    FIXED_AMOUNT: 'Fixed amount',
    FREE_SHIPPING: 'Free shipping',
  },
  value: {
    freeShipping: 'Free shipping',
  },
  // Trang danh sách
  title: 'Promotion Management',
  newPromotion: 'New Promotion',
  columns: {
    code: 'CODE',
    name: 'Name',
    type: 'Type',
    value: 'Value',
    start: 'Start',
    end: 'End',
    created: 'Created',
  },
  fields: {
    name: 'Name',
    code: 'Code',
    type: 'Type',
    value: 'Value',
    startDate: 'Start Date',
    endDate: 'End Date',
  },
  confirmDelete: 'Confirm you want to delete user "{name}".',
  // Form thêm / sửa
  handle: {
    createTitle: 'Create a new promotion',
    modifyTitle: 'Modify promotion',
    breadcrumb: 'Promotion management',
    active: 'Active',
    inactive: 'Inactive',
    reset: 'Reset',
    saveChanges: 'Save changes',
    create: 'Create book',
    deleteNote:
      'This book, previously part of your business inventory, is no longer in active commerce and is now available for sale to interested buyers looking for a great deal.',
    deleteConfirmBefore: 'Do you want delete ',
    deleteConfirmAfter: ", after delete you can't undo",
  },
  detail: {
    title: 'Detail',
    subheader: 'Title, description, picture',
    name: 'Promotion name',
    code: 'Code book',
    description: 'Description',
    type: 'Type',
    value: 'Value',
    nameRequired: 'Name is required.',
    nameMax: 'Name must be less than 100 characters.',
    codeRequired: 'Code is required.',
    codeLength: 'Code must be 6 characters.',
    descriptionMax: 'Description must be less than 500 characters.',
    // Chữ trong ô chọn loại, giữ nguyên chữ thường như bản cũ (CSS viết hoa chữ cái đầu)
    typeOption: {
      PERCENTAGE: 'percentage',
      FIXED_AMOUNT: 'fixed amount',
      FREE_SHIPPING: 'free shipping',
    },
  },
  statusCard: {
    subheader: 'Start date, end date, active',
    startDate: 'Start date',
    endDate: 'End date',
    startRequired: 'Start date is required.',
    endRequired: 'End date is required.',
    endFuture: 'End date must be in the future.',
  },
  books: {
    title: 'Select book',
    subheader: 'Select book apply promotion',
    removeAll: 'Remove {count} book',
    columns: {
      name: 'Name',
      price: 'Price',
      created: 'Created',
    },
    fields: {
      name: 'Name',
      description: 'Description',
      price: 'Price',
      created: 'Created',
    },
  },
};
