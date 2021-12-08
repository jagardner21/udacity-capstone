// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '1i0u7mypk7'
export const apiEndpoint = `https://${apiId}.execute-api.us-west-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-jkk6gg15.us.auth0.com',            // Auth0 domain
  clientId: 'UamUXQMboR1CH2RaXSmmH373rI0BxxIb',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
