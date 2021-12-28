import { apiEndpoint } from '../config'
import { Contact } from '../types/Contact';
import { CreateContactRequest } from '../types/CreateContactRequest';
import Axios from 'axios'
import { UpdateContactRequest } from '../types/UpdateContactRequest';

export async function getContacts(idToken: string): Promise<Contact[]> {
  console.log('Fetching contacts')

  const response = await Axios.get(`${apiEndpoint}/contacts`, { 
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Contacts:', response.data)
  return response.data.items
}

export async function createContact(
  idToken: string,
  newContact: CreateContactRequest
): Promise<Contact> {
  const response = await Axios.post(`${apiEndpoint}/contacts`,  JSON.stringify(newContact), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchContact(
  idToken: string,
  contactId: string,
  updatedContact: UpdateContactRequest
): Promise<void> {
  console.log("MADE IT HERE")
  console.log(`URL: ${apiEndpoint}/contacts/${contactId}`)
  await Axios.patch(`${apiEndpoint}/contacts/${contactId}`, JSON.stringify(updatedContact), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteContact(
  idToken: string,
  contactId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/contacts/${contactId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  contactId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/contacts/${contactId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
