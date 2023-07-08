export default {
  oidc: {
    clientId: '{YOUR_OKTA_APPLICATION_CLIENT_ID}',
    issuer: 'https://{YOUR_OKTA_APPLICATION_DOMAIN}/oauth2/default',
    redirectUri: 'http://localhost:4200/login/callback',
    scopes: ['openid', 'profile', 'email'],
  },
};
