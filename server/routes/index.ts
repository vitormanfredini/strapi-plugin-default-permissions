export default [
  {
    method: 'GET',
    path: '/getCurrentPermissions',
    handler: 'permissions.getCurrentPermissions',
    config: {
      policies: [],
    },
  },
  {
    method: 'POST',
    path: '/applyDefaultPermissions',
    handler: 'permissions.applyDefaultPermissions',
    config: {
      policies: [],
    },
  },
];
