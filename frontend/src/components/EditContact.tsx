import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile, patchContact } from '../api/contacts-api'

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

export class EditTodo extends React.PureComponent<
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
    this.setState({modified: true})
    this.setState({ [name]: value } as Pick<EditContactState, any>)
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

      await patchContact(this.props.auth.getIdToken, this.props.match.params.contactId, {
        name: this.state.name,
        phoneNumber: this.state.phoneNumber,
        email: this.state.email
      })
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
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

          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {

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
