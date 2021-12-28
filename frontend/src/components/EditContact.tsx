import * as React from 'react'
import { Form, Button, FormButton } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile, patchContact, getContacts } from '../api/contacts-api'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditContactProps {
  match: {
    params: {
      contactId: string
    }
  }
  auth: Auth
}

interface EditContactState {
  file: any
  name: string
  phoneNumber: string
  email: string
  modified: boolean
  uploadState: UploadState
}

export class EditContact extends React.PureComponent<
  EditContactProps,
  EditContactState
> {
  state: EditContactState = {
    file: undefined,
    name: '',
    phoneNumber: '',
    email: '',
    modified: false,
    uploadState: UploadState.NoUpload
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    let { name, value } = event.target
    this.setState({ [name]: value } as Pick<EditContactState, any>)
    this.setState({modified: true})
}

  handleFileSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.contactId)

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)

      alert('File was uploaded!')
    } catch (error) {
      alert('Could not upload a file: ' + error.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  handleEditSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()
    try {
      if(!this.state.modified){
        alert('No changes were made. To make changes, modify one or more of the below fields.')
        return
      }

      await patchContact(this.props.auth.getIdToken(), this.props.match.params.contactId, {
        name: this.state.name,
        phoneNumber: this.state.phoneNumber,
        email: this.state.email
      })
      alert("Successfully updated contact information!")
    } catch (error){
      alert(`Unable to update Contact ID ${this.props.match.params.contactId}. Error: ${error.message}`)
    } finally {
      this.setState({modified: false})
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  async componentDidMount(){
    try{
      const contacts = await getContacts(this.props.auth.getIdToken())
      const contactBeingEdited = contacts.filter(contact => contact.contactId === this.props.match.params.contactId)[0]
      this.setState({
        name: contactBeingEdited.name,
        phoneNumber: contactBeingEdited.phoneNumber,
        email: contactBeingEdited.email
      })
    } catch (error) {
      alert (`Failed to fetch contact with id of ${this.props.match.params.contactId}, error: ${error.message}`)
    }

  }

  render() {
    return (
      <div>
        <h1>Upload new image</h1>

        <Form onSubmit={this.handleFileSubmit}>
          <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>

          {this.renderUploadImageButton()}
        </Form>
        
        <h1>Edit Contact Details</h1>
        <Form onSubmit={this.handleEditSubmit}>
          <Form.Field>
            <label>Name</label>
            <input 
              type="text"
              name="name"
              placeholder={this.state.name}
              onChange={this.handleChange}
              />
          </Form.Field>
          <Form.Field>
            <label>Phone Number</label>
            <input 
              type="text"
              name="phoneNumber"
              placeholder={this.state.phoneNumber}
              onChange={this.handleChange}
              />
          </Form.Field>
          <Form.Field>
            <label>Email</label>
            <input 
              type="text"
              name="email"
              placeholder={this.state.email}
              onChange={this.handleChange}
              />
          </Form.Field>
          <Button type="submit" onClick={() => this.handleEditSubmit} color="blue">Update Details</Button>
        </Form>
        
      </div>
    )
  }

  renderUploadImageButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }
}
