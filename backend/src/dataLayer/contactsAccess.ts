// const XAWS = require('aws-xray-sdk')
const AWS = require('aws-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
const logger = createLogger('dataLayer')
import { ContactItem } from '../models/ContactItem'
import { UpdateContactRequest } from '../requests/UpdateContactRequest'

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }
  return new AWS.DynamoDB.DocumentClient()
}

export class ContactData {
  constructor(
    private readonly dynamoDBClient: DocumentClient = createDynamoDBClient(),
    private readonly S3 = new AWS.S3({signatureVersion: 'v4'}),
    private readonly contactsTable = process.env.CONTACTS_TABLE,
    private readonly contactsTableIndex = process.env.USER_ID_INDEX,
    private readonly bucket = process.env.ATTACHMENT_S3_BUCKET
  ) {
  }

  async getContact(userId: string, contactId: string): Promise<ContactItem> {
    const result = await this.dynamoDBClient.get({
      TableName: this.contactsTable,
      Key: {
        userId,
        contactId
      }
    }).promise()

    return result.Item as ContactItem
  }

  async getContactsForUser(userId: string): Promise<ContactItem[]> {
    logger.info(`Getting Contacts for user id: ${userId}`)
    const result = await this.dynamoDBClient
      .query({
        TableName: this.contactsTable,
        IndexName: this.contactsTableIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    logger.info(`There are ${result.Count} Contacts for user id: ${userId}.`)
    return result.Items as ContactItem[]
  }

  async createContact(contact: ContactItem): Promise<ContactItem> {
    await this.dynamoDBClient.put({
      TableName: this.contactsTable,
      Item: contact
    }).promise()

    logger.info(`Created contact ${contact.contactId} for user ${contact.userId}.`)
    return contact
  }

  async updateContact(userId: string, contactId: string, contact: UpdateContactRequest): Promise<Boolean> {
    let isSuccess = false
    try {
      await this.dynamoDBClient
        .update({
          TableName: this.contactsTable,
          Key: {
            userId,
            contactId
          }, 
          UpdateExpression:
            'set #name = :name, #phoneNumber = :phoneNumber, #email = :email',
          ExpressionAttributeValues: {
            ':name': contact.name,
            ':phoneNumber': contact.phoneNumber,
            ':email': contact.email
          },
          ExpressionAttributeNames: {
            '#name': 'name',
            '#phoneNumber': 'phoneNumber',
            '#email': 'email'
          }
        }).promise()
        isSuccess = true
    } catch (e) {
      logger.error('Error occurred while updating Contact.', {
        error: e,
        data: {
          userId,
          contactId,
          contact
        }
      })
    }

    return isSuccess
  }

  async deleteContact(userId: string, contactId: string): Promise<Boolean> {
    let success = false
    try {
      await this.dynamoDBClient.delete({
        TableName: this.contactsTable,
        Key: {
          userId,
          contactId
        }
      }).promise()
      logger.info(`Successfully deleted Contact id: ${contactId}`)
      success = true
    } catch (e) {
      logger.info('Error occurred while deleting Contact from database', {error: e})
    }
    return success
  }

  async generateUploadUrl(contactId: string, userId: string): Promise<string> {
    const uploadUrl = this.S3.getSignedUrl("putObject", {
      Bucket: this.bucket,
      Key: contactId,
      Expires: 300
  });
  await this.dynamoDBClient.update({
        TableName: this.contactsTable,
        Key: { userId, contactId },
        UpdateExpression: "set attachmentUrl=:URL",
        ExpressionAttributeValues: {
          ":URL": uploadUrl.split("?")[0]
      },
      ReturnValues: "UPDATED_NEW"
    })
    .promise();
  return uploadUrl;
}
}