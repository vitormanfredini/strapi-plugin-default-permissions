import { Strapi } from '@strapi/strapi';

export interface DataResponseDefaultPermissions {
  message?: string,
  data?: {
    count: number
  },
  status: 'error' | 'ok'
}

type DefaultPermissionsRole = {
  id: number
  type: string
  permissions: Array<string>
}

export interface DefaultPermissionsPluginConfig {
  defaultPermissions: Array<DefaultPermissionsRole>
}

export default ({ strapi }: { strapi: Strapi }) => ({

  async restoreDefaultPermissions() {

    // TODO: add a db transaction here when strapi v4 add support to it

    const pluginConfig: DefaultPermissionsPluginConfig = strapi.config.get('plugin.default-permissions');
    if(!pluginConfig.defaultPermissions || pluginConfig.defaultPermissions.length == 0){
      const response: DataResponseDefaultPermissions = {
        message: 'Default permissions config not found.',
        status: 'error'
      }
      return response;
    }

    const currentRoles = await strapi.entityService.findMany('plugin::users-permissions.role', {
      populate: 'permissions',
      sort: {
        id: 'asc'
      },
    });

    const rolesArrSameLength = currentRoles.length === pluginConfig.defaultPermissions.length;
    const rolesArrSameIdsAndTypes = currentRoles.every(role => pluginConfig.defaultPermissions.find(defaultRole => defaultRole.type == role.type && defaultRole.id == role.id));
    if (!rolesArrSameLength || !rolesArrSameIdsAndTypes) {
      const response: DataResponseDefaultPermissions = {
        message: 'Your current roles are different than the ones in the config.',
        status: 'error'
      }
      return response;
    }

    // delete all permissions
    const currentPermissions = await strapi.entityService.findMany('plugin::users-permissions.role', {});
    for (const permission of currentPermissions) {
      await strapi.entityService.delete(
        'plugin::users-permissions.permission',
        permission.id
      );
    }

    let countPermissionsApplied = 0;
    for (const role of pluginConfig.defaultPermissions) {

      // add permissions from the config
      const permissionAddedIds = [];
      for (const permission of role.permissions) {
        const createdPermission = await strapi.entityService.create('plugin::users-permissions.permission', {
          data: {
            action: permission
          }
        });
        permissionAddedIds.push(createdPermission.id);
        countPermissionsApplied += 1;
      }

      // update the roles with the new permissions
      await strapi.entityService.update(
        'plugin::users-permissions.role',
        role.id,
        {
          data: {
            permissions: permissionAddedIds
          }
        }
      );

    }

    const response: DataResponseDefaultPermissions = {
      status: 'ok',
      data: {
        count: countPermissionsApplied
      }
    }
    return response;
  }

});
