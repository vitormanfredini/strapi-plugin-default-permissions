import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

import { Stack, Typography, Button, Icon, Alert, Box } from '@strapi/design-system'

import './styles.css';

type PermissionsData = Array<unknown>;

type PluginConfigState = {
  defaultPermissions: PermissionsData
}

const HomePage: React.VoidFunctionComponent = () => {
  const history = useHistory();
  const [currentPermissions, setCurrentPermissions] = useState<PermissionsData>();
  const [pluginConfig, setPluginConfig] = useState<PluginConfigState>();
  const [defaultPermissionsCount, setDefaultPermissionsCount] = useState<number>(0);
  const [messageAlert, setMessageAlert] = useState({
    message: '',
    type: 'success',
    title: 'Success'
  });
  const [enableAlert, setEnableAlert] = useState(false);

  const token = localStorage.getItem('jwtToken') ? localStorage.getItem('jwtToken') : sessionStorage.getItem('jwtToken');
  const tokenFormatado = token?.replace(/['"]+/g, '');

  const baseURL = process.env.STRAPI_ADMIN_BACKEND_URL;

  const handleNavigateToPermissionsPage = () => {
    history.push(`/settings/users-permissions/roles`);
  };

  const getCurrentPermissions = async () => {
    try {
      const { data } = await axios.get(
        `${baseURL}/default-permissions/getCurrentPermissions`,
        {
          headers: {
            'Authorization': `Bearer ${tokenFormatado}`
          }
        }
      );
      setCurrentPermissions(data.currentPermissions);
      setPluginConfig(data.pluginConfig);

      let countDefaultPermissions = 0;
      data.pluginConfig?.defaultPermissions?.forEach(role => {
        countDefaultPermissions += role.permissions.length;
      })
      setDefaultPermissionsCount(countDefaultPermissions);
    } catch {
      setCurrentPermissions([]);
      setPluginConfig({
        defaultPermissions: []
      });
      setDefaultPermissionsCount(0);
    }
  };

  const handleApplyPermissions = async () => {

    await axios.post(
      `${baseURL}/default-permissions/applyDefaultPermissions`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${tokenFormatado}`
        }
      }
    )
    .then(response => {
      console.log(response);
      setMessageAlert({
        message: response.data.message,
        type: 'success',
        title: 'Success:'
      });
      setEnableAlert(true);
    })
    .catch(error => {
      setMessageAlert({
        message: error.response.data.error.message,
        type: 'danger',
        title: 'Error:'
      });
      setEnableAlert(true);
    })
    .finally(() => {
      setTimeout(() => {
        setEnableAlert(false);
      },5000);
    })

  }

  useEffect(() => {
    getCurrentPermissions();
  }, []);

  return (
    <div className="containerHome">

      {enableAlert && (
        <div className="containerAlert">
          <Alert
            closeLabel="Close alert"
            title={messageAlert.title}
            variant={messageAlert.type}
            className="aleart"
            onClose={() => setEnableAlert(false)}>
            {messageAlert.message}
          </Alert>
        </div>
      )}

      <Stack spacing={4} padding={100}>
        <Typography as="h1" variant="alpha">
          Default Permissions
        </Typography>

        <Typography variant="epsilon" className="subtitle" textColor="neutral500">
          Set up your API permissions in your code to easily apply them later.
        </Typography>

        { pluginConfig && (
          <Box className="containerTable" background="neutral0" shadow="tableShadow">
            <div className="wrapperButtonApplyDefaultPermissions">
              <Button onClick={handleApplyPermissions}>Manually apply default permissions ({defaultPermissionsCount} permissions in {pluginConfig.defaultPermissions.length} roles)</Button>
              <Typography className="warningAboutApply" variant="epsilon" fontWeight="semiBold" textColor="neutral800">
                This will discard all your current permissions before applying the ones from your config.
              </Typography>
            </div>
          </Box>
        ) }

        {/* { process.env.NODE_ENV === 'development' && ( */}
        { (
          <Box className="containerTable" background="neutral0" shadow="tableShadow">
            <Typography className="copyConfig" variant="epsilon" fontWeight="semiBold" textColor="neutral800">
              During development, after <a className="permissionsPageLink" onClick={handleNavigateToPermissionsPage}>changing your permissions</a>, come back to this page and copy this config block to your <em className="emphasis">config/plugins.js</em>:
            </Typography>
            <pre>
              {/* "config: " + JSON.stringify({defaultPermissions: currentPermissions}, null, "\t") */}
              <span className="notImportant">'default-permissions': &#123;<br />
              &#9;enabled: true,<br />
              &#9;resolve: './src/plugins/default-permissions',<br />
              &#9;config: &#123;<br />
              &#9;&#9;...<br />
              </span>
              &#9;&#9;<div className="permissionsCopyPasteBlock"> defaultPermissions: { JSON.stringify(currentPermissions, null, "\t") }</div>
              <br />
              <span className="notImportant">
              &#9;&#9;...<br />
              &#9;&#125;<br />
              &#125;
              </span>

            </pre>
          </Box>
        ) }

      </Stack>
    </div>
  );
};

export default HomePage;
