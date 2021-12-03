import 'source-map-support/register'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateContactRequest } from '../../requests/UpdateContactRequest'
import { updateContact } from '../../businessLogic/contacts'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const contactId = event.pathParameters.contactId
    const updatedContact: UpdateContactRequest = JSON.parse(event.body)
    const userId: string = getUserId(event)
    const success = await updateContact(userId, contactId, updatedContact)

    if (!success) {
      return {
        statusCode: 500,
        body: "Error occurred while updating Contact."
      }
    }
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: `Successfully updated contact id: ${contactId}`
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
