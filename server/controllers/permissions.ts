import { Strapi } from '@strapi/strapi';
import { sanitize } from '@strapi/utils';
import { DataResponseDefaultPermissions } from '../services/permissions';

export default ({ strapi }: { strapi: Strapi }) => ({

  async getCurrentPermissions(ctx) {

    const roles = await strapi.entityService.findMany('plugin::users-permissions.role', {
      populate: 'permissions',
      sort: {
        id: 'asc'
      },
    });

    // compose current permissions object
    const objRoles = [];
    for (const role of roles) {
      const roleWithPermissions = {
        id: role.id,
        type: role.type,
        permissions: []
      };
      role.permissions.forEach(permission => {
        roleWithPermissions.permissions.push(permission.action);
      });
      objRoles.push(roleWithPermissions);
    }

    const pluginConfig = strapi.config.get('plugin.default-permissions');

    ctx.body = await sanitize.contentAPI.output({
      currentPermissions: objRoles,
      pluginConfig: pluginConfig.defaultPermissions ? pluginConfig : false
    });
  },

  async applyDefaultPermissions(ctx) {

    const pluginConfig = strapi.config.get('plugin.default-permissions');

    const response: DataResponseDefaultPermissions = await strapi
      .plugin('default-permissions')
      .service('permissions')
      .restoreDefaultPermissions();

    if (response.status == 'error') {
      return ctx.badRequest(response.message);
    }

    ctx.body = await sanitize.contentAPI.output({
      'ok': true,
      'message': `${response.data.count} permissions applied in ${pluginConfig.defaultPermissions.length} roles.`
    });

  },

});
