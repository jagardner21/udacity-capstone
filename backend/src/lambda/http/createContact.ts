import 'source-map-support/register'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { ContactItem } from '../../models/ContactItem'
import { CreateContactRequest } from '../../requests/CreateContactRequest'
import { createContact } from '../../businessLogic/contacts'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('dataLayer')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newContact: CreateContactRequest = JSON.parse(event.body)
    const userId: string = getUserId(event)
    logger.info(`User id parsed: ${userId}`)

    // verify a name is given
    if (!newContact.name) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Must supply a name for the new contact.'
        })
      }
    }

    // create the item
    let item: ContactItem
    try {
      item = await createContact(newContact, userId)
    } catch (e) {
      logger.error('Error creating contact', {
        error: e
      })
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Error creating contact.'
        })
      }
    }

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: item
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)