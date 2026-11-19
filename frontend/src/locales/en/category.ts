export const category = {
  title: 'Category Management',
  newCategory: 'New category',
  searchPlaceholder: 'Search category...',
  summary: '{count} categories · {links} book links',
  columns: {
    name: 'Name',
    books: 'Books',
  },
  form: {
    name: 'Category name',
    newName: 'New name',
    renameTitle: 'Rename category "{name}"',
  },
  validation: {
    required: 'Category name is required',
    maxLength: 'Maximum {max} characters',
    noSlash: 'Category name cannot contain "/"',
    noChange: 'New name must be different',
    exists: 'Category already exists',
  },
  deleteConfirm: 'Confirm you want to delete category "{name}".',
  deleteWarning:
    '{count} book(s) will no longer belong to this category. The books themselves are not deleted.',
};
