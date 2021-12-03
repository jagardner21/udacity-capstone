import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteContact } from '../../businessLogic/contacts'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const contactId = event.pathParameters.contactId
    const userId: string = getUserId(event)
    const success = await deleteContact(userId, contactId)

    if (!success) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Error occurred while deleting Contact.'
        })
      }
    }
    return {
      statusCode: 204,
      body: JSON.stringify({
        message: "Contact deleted successfully."
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
