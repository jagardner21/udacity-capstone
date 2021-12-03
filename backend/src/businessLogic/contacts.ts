import * as uuid from 'uuid'

import { ContactItem } from '../models/ContactItem'
import { ContactData } from '../dataLayer/contactsAccess'
import { CreateContactRequest } from '../requests/CreateContactRequest'
import { UpdateContactRequest } from '../requests/UpdateContactRequest'

const contactData = new ContactData()

export async function getUserContacts(userId: string): Promise<ContactItem[]> {
  return await contactData.getContactsForUser(userId)
}

export async function getContact(userId: string, contactId: string): Promise<ContactItem> {
  return contactData.getContact(userId, contactId)
}

export async function deleteContact(userId: string, contactId: string): Promise<Boolean> {
  return contactData.deleteContact(userId, contactId)
}

export async function updateContact(
  userId: string,
  contactId: string,
  updatedContact: UpdateContactRequest
): Promise<Boolean> {
  return contactData.updateContact(userId, contactId, updatedContact)
}

export async function createContact(
  createContactRequest: CreateContactRequest,
  userId: string
): Promise<ContactItem> {

  return await contactData.createContact({
    userId: userId,
    contactId: uuid.v4(),
    createdAt: new Date().toISOString(),
    name: createContactRequest.name,
    phoneNumber: createContactRequest.phoneNumber,
    email: createContactRequest.email
  })
}

export async function generateUploadUrl(contactId: string, userId: string): Promise<string>{
  return await contactData.generateUploadUrl(contactId, userId)
}