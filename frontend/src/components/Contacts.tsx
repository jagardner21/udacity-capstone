import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Form,
  FormGroup
} from 'semantic-ui-react'

import { createContact, deleteContact, getContacts, patchContact } from '../api/contacts-api'
import Auth from '../auth/Auth'
import { Contact } from '../types/Contact'

interface ContactsProps {
  auth: Auth,
  history: History
}

interface ContactsState {
  contacts: Contact[],
  newContactName: string,
  newContactPhoneNumber: string,
  newContactEmail: string,
  loadingContacts: boolean,
  modified: boolean
}

export class Contacts extends React.PureComponent<ContactsProps, ContactsState> {
  state: ContactsState = {
    contacts: [],
    newContactName: '',
    newContactPhoneNumber: '',
    newContactEmail: '',
    loadingContacts: true,
    modified: false
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    let { name, value } = event.target
    this.setState({ [name]: value } as Pick<ContactsState, any>)
    this.setState({modified: true})
}

  onEditButtonClick = (contactId: string) => {
    this.props.history.push(`/contacts/${contactId}/edit`)
  }

  onContactCreate = async (event: React.SyntheticEvent) => {
    event.preventDefault()
    console.log(`New Contact Name: ${this.state.newContactName}`)
    try {
      if(!this.state.modified){
        alert("No contact details entered for the new contact. Please enter new contact details before clicking 'Add New Contact'.")
        return
      }
      const newContact = await createContact(this.props.auth.getIdToken(), {
        name: this.state.newContactName,
        phoneNumber: this.state.newContactPhoneNumber,
        email: this.state.newContactEmail
      })
      this.setState({
        contacts: [...this.state.contacts, newContact],
        newContactName: '',
        newContactPhoneNumber: '',
        newContactEmail: ''
      })
    } catch (error){
      alert(`Contact creation failed. Error: ${error.message}`)
    }
  }

  onContactDelete = async (contactId: string) => {
    try {
      await deleteContact(this.props.auth.getIdToken(), contactId)
      this.setState({
        contacts: this.state.contacts.filter(contact => contact.contactId != contactId)
      })
    } catch {
      alert('Contact deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const contacts = await getContacts(this.props.auth.getIdToken())
      this.setState({
        contacts,
        loadingContacts: false
      })
    } catch (error) {
      alert(`Failed to fetch contacts: ${error.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Contacts</Header>
        <hr/>
        {this.renderCreateContactInput()}

        {this.renderContacts()}
      </div>
    )
  }

  renderCreateContactInput() {
    return (
      <Grid.Row padded>
        <h4>Create New Contact</h4>
        <Grid.Column width={16}>
          <Form>
            <FormGroup>
              <Form.Field>
                <label>Name: </label>
                <input
                  type="text"
                  name="newContactName"
                  placeholder="ex. Anthony L. Ray"
                  value={this.state.newContactName}
                  onChange={this.handleChange}
                  />
              </Form.Field>
              <Form.Field>
                <label>Phone Number: </label>
                <input
                  type="text"
                  name="newContactPhoneNumber"
                  placeholder="ex. 8008492568"
                  value={this.state.newContactPhoneNumber}
                  onChange={this.handleChange}
                  />
              </Form.Field>
              <Form.Field>
                <label>Email: </label>
                <input
                  type="text"
                  name="newContactEmail"
                  placeholder="ex. sir@mixalot.com"
                  value={this.state.newContactEmail}
                  onChange={this.handleChange}
                  />
              </Form.Field>
              <Form.Button onClick={this.onContactCreate}>Add New Contact</Form.Button>
            </FormGroup>
          </Form>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderContacts() {
    if (this.state.loadingContacts) {
      return this.renderLoading()
    }

    return this.renderContactsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Contacts
        </Loader>
      </Grid.Row>
    )
  }

  renderContactsList() {
    return (
      <Grid padded>
        <h4>Contacts List</h4>
        {this.state.contacts.map((contact, pos) => {
          return (
            <Grid.Row key={contact.contactId}>
              <Grid.Column width={4} verticalAlign="middle">
                {contact.name}
              </Grid.Column>
              <Grid.Column width={5} verticalAlign="middle">
                Ph: {contact.phoneNumber}
              </Grid.Column>
              <Grid.Column width={5} verticalAlign="middle">
                Email: {contact.email}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
              <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(contact.contactId)}
                >
                  <Icon name="pencil" />
                </Button>
                <Button
                  icon
                  color="red"
                  onClick={() => this.onContactDelete(contact.contactId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {contact.attachmentUrl && (
                <Image src={contact.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
