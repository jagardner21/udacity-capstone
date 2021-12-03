import 'source-map-support/register'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { createLogger } from '../../utils/logger'
import { generateUploadUrl } from '../../businessLogic/contacts'
import { getUserId } from '../utils'

const logger = createLogger('generateUploadUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const contactId = event.pathParameters.contactId
    const userId: string = getUserId(event)

    // check for missing contact id
    if (!contactId) {
      return {
        statusCode: 400,
        body: JSON.stringify({error: 'contactId was not provided'})
      }
    }

    const signedUrl = await generateUploadUrl(contactId, userId)

    logger.info(`Generated signed url for a Contact`, {
      url: signedUrl,
      contactId: contactId
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl: signedUrl
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)