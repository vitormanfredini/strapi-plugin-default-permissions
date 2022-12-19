import { Strapi } from '@strapi/strapi';
import { DataResponseDefaultPermissions } from './services/permissions';

export default async ({ strapi }: { strapi: Strapi }) => {

  const pluginConfig = strapi.config.get('plugin.default-permissions');

  if (pluginConfig?.autoApply === true) {

    const response: DataResponseDefaultPermissions = await strapi
      .plugin('default-permissions')
      .service('permissions')
      .restoreDefaultPermissions();

    if (response.status == 'ok') {
      strapi.log.info(`Default permissions: ${response.data.count} permissions automatically applied.`)
    }else{
      strapi.log.error(`Default permissions: ${response.message}`)
    }

  }

};
