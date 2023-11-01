const express = require('express')
import pickHandler from '@/helpers/routeHandler'
import fetch from '@/handlers/msGraphApi'
import * as dotenv from 'dotenv'
dotenv.config()

const router = express.Router()

const REDIRECT_URI = process.env.MS_TEAMS_REDIRECT_URI
const POST_LOGOUT_REDIRECT_URI = process.env.POST_LOGOUT_REDIRECT_URI

const lOGIN_TYPE = {
  LOGIN: 'login',
  SUCCESS: 'success',
  FAILED: 'failed',
}

// /**
//  * Prepares the auth code request parameters and initiates the first leg of auth code flow
//  * @param req: Express request object
//  * @param res: Express response object
//  * @param next: Express next function
//  * @param authCodeUrlRequestParams: parameters for requesting an auth code url
//  * @param authCodeRequestParams: parameters for requesting tokens using auth code
//  */
// async function redirectToAuthCodeUrl(
//   req,
//   res,
//   next,
//   // authCodeUrlRequestParams,
//   // authCodeRequestParams
// ) {
//   // Generate PKCE Codes before starting the authorization flow
//   // const { verifier, challenge } = await cryptoProvider.generatePkceCodes()

//   // Set generated PKCE codes and method as session vars
//   // req.session.pkceCodes = {
//   //   challengeMethod: 'S256',
//   //   verifier: verifier,
//   //   challenge: challenge,
//   // }

//   // const pkceCodes = {
//   //   challengeMethod: 'S256',
//   //   verifier: verifier,
//   //   challenge: challenge,
//   // }

//   req.session.authCodeUrlRequest = {
//     redirectUri: REDIRECT_URI,
//     responseMode: 'form_post', // recommended for confidential clients
//     // codeChallenge: pkceCodes.challenge,
//     // codeChallengeMethod: pkceCodes.challengeMethod,
//     // ...authCodeUrlRequestParams,
//   }

//   req.session.authCodeRequest = {
//     redirectUri: REDIRECT_URI,
//     code: '',
//     // ...authCodeRequestParams,
//   }

//   // Get url to sign user in and consent to scopes needed for application
//   try {
//     // const authCodeUrlResponse = await msalInstance.getAuthCodeUrl(
//     //   req.session.authCodeUrlRequest
//     // )

//     res.redirect(authCodeUrlResponse)
//   } catch (error) {
//     next(error)
//   }
// }

// router.get('/auth/signin', async function (req, res, next) {
//   // create a GUID for crsf
//   req.session.csrfToken = cryptoProvider.createNewGuid()

//   /**
//    * The MSAL Node library allows you to pass your custom state as state parameter in the Request object.
//    * The state parameter can also be used to encode information of the app's state before redirect.
//    * You can pass the user's state in the app, such as the page or view they were on, as input to this parameter.
//    */
//   const state = cryptoProvider.base64Encode(
//     JSON.stringify({
//       csrfToken: req.session.csrfToken,
//       redirectTo: `${process.env.MS_TEAMS_REDIRECT_FE}/login-ms-teams`,
//     })
//   )

//   const authCodeUrlRequestParams = {
//     state: state,

//     /**
//      * By default, MSAL Node will add OIDC scopes to the auth code url request. For more information, visit:
//      * https://docs.microsoft.com/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
//      */
//     scopes: [],
//   }

//   const authCodeRequestParams = {
//     /**
//      * By default, MSAL Node will add OIDC scopes to the auth code request. For more information, visit:
//      * https://docs.microsoft.com/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
//      */
//     scopes: [],
//   }

//   // trigger the first leg of auth code flow
//   return redirectToAuthCodeUrl(
//     req,
//     res,
//     next,
//     authCodeUrlRequestParams,
//     authCodeRequestParams
//   )
// })

// router.post(
//   '/auth/redirect',
//   async function (req, res, next) {
//     if (req.body.state) {
//       const state = JSON.parse(cryptoProvider.base64Decode(req.body.state))

//       if (state.csrfToken === req.session.csrfToken) {
//         req.session.authCodeRequest.code = req.body.code // authZ code
//         req.session.authCodeRequest.codeVerifier =
//           req.session.pkceCodes.verifier // PKCE Code Verifier

//         try {
//           const tokenResponse = await msalInstance.acquireTokenByCode(
//             req.session.authCodeRequest
//           )
//           // req.session.accessToken = tokenResponse.accessToken
//           // req.session.idToken = tokenResponse.idToken
//           // req.session.account = tokenResponse.account
//           // req.session.isAuthenticated = true
//           req.session.destroy()
//           req.body.state = state
//           req.body.tokenResponse = tokenResponse
//           next()
//         } catch (error) {
//           console.log(error)
//           res.redirect(
//             `${state.redirectTo}?token=&&loginType=${lOGIN_TYPE.FAILED}`
//           )
//         }
//       } else {
//         console.log('error csrfToken')
//         res.redirect(
//           `${state.redirectTo}?token=&&loginType=${lOGIN_TYPE.FAILED}`
//         )
//       }
//     } else {
//       console.log('error state')
//       res.redirect(`${state.redirectTo}?token=&&loginType=${lOGIN_TYPE.FAILED}`)
//     }
//   },
//   pickHandler('MsTeamsController@signin')
// )

router.post('/auth', pickHandler('LoginController@AuthController'))

// router.get('/auth/signout', function (req, res) {
//   const logoutUri = `${msalConfig.auth.authority}/oauth2/v2.0/logout?post_logout_redirect_uri=${POST_LOGOUT_REDIRECT_URI}`
//   res.redirect(logoutUri)
// })

// router.get('/profile', pickHandler('MsTeamsController@getProfile'))

export default router
