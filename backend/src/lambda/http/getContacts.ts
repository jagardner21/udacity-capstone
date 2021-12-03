import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

import { getUserContacts } from '../../businessLogic/contacts'
import { getUserId } from '../utils';

const logger = createLogger('dataLayer')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event)
    logger.info(`Getting contacts for user id: ${userId}`)
    const contacts = await getUserContacts(userId)
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        items: contacts
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
