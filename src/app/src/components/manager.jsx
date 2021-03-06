import React, { PropTypes } from 'react'
import ClassName from 'classnames'
import websocket from './websocket.jsx'

class PasswordListAdd extends React.Component {

  constructor(props) {
    super(props)

    this.ws = new websocket()
    this.state = {
      key: "",
      identifier: "",
      password: ""
    }
  }

  // On each key change, thes handleX functions will push the input field value to the store
  handleIdentifier(e) {
   this.setState({identifier: e.target.value});
  }


  handlePassword(e) {
     this.setState({password: e.target.value});
  }

  handleKeypress(e) {
    if (e.key == 'Enter') {
      this.handleSubmit(e)
    }
  }

  // handleSubmit inserts the data into store
  handleSubmit(e) {
    e.preventDefault()

    var key = Math.random().toString(36).substring(24)

    let request = {
      action: "ADD",
      payload: {
        key: btoa(key),
        identifier: btoa(this.state.identifier),
        value: btoa(this.state.password)
      }
    }

    // check if the fields are empty
    if (this.state.password === "" || this.state.identifier === "") {
      // TODO(mnzt): Send a flash notification warning of empty fields
    } else {
      this.ws.send(request)

      // reset the form
      ReactDOM.findDOMNode(this.refs.identifier).value = ""; // Unset the value
      ReactDOM.findDOMNode(this.refs.password).value = ""; // Unset the value
      //reset the state
      this.setState({
        key: "",
        identifier: "",
        password: ""
      })
    }
  }

  render() {
    return (
      <row data-centered>
        <column cols="8">
          <row data-centered data-end>
            <h4>Add Account</h4>
          </row>
          <row data-centered>
            <div className="btn-append">
              <input  ref="identifier"
                      type="text"
                      name="key"
                      placeholder="Account/site"
                      onChange={ this.handleIdentifier.bind(this) }
              />
              <input  ref="password"
                      type="password"
                      name="value"
                      placeholder="Password"
                      onChange={ this.handlePassword.bind(this) }
                      onKeyPress={ this.handleKeypress.bind(this) }
              />
              <span>
                <button className="btn" onClick={ this.handleSubmit.bind(this) } data-outline>Add</button>
              </span>
            </div>
          </row>
        </column>
      </row>
    )
  }
}

class PasswordList extends React.Component {

  constructor() {
    super()

    this.ws = new websocket()
    this.state = {
            accounts: []
    }

    let request = {
      action: "ALL"
    }

    this.ws.onopen = () => {
      this.ws.send(request)
    }
  }

  componentDidMount() {
    this.ws.listen()
      .then((response) => {
        this.setState({
          accounts: response.message
        })
      })
  }

  render() {

    let accounts = this.state.accounts.map((account) => {
      return <PasswordListEntry key={ account.key } _key={ account.key } identifier={ account.identifier } password={ account.value }/>
    })

    return (
    <row data-centered>
      <column cols="8">
        <table>
          <thead>
            <tr>
              <td className="width-4 text-centered">Account</td>
              <td className="width-5 text-centered">Password</td>
              <td className="width-3"></td>
            </tr>
          </thead>
          <tbody>
            { accounts }
          </tbody>
        </table>
      </column>
    </row>
  )
  }
}

class PasswordListEntry extends React.Component {
  constructor(props) {
    super(props);

    this.ws = new websocket()
    this.props = props
    this.state = {
      buttonOK: false,
    }
  }

  deleteEntry(account) {
    let data = {
      action: "DELETE",
      payload: {
        key: account._key,
      }
    }

    this.ws.send(data)
  }

  confirmCopy() {
    // HACK(mnzt): :sick: this is horrible.

    // set classes to make the button green
    this.setState({buttonOK: true})
    setTimeout(function () {
      this.setState({buttonOK: false})
    }.bind(this), 750)
  }

  render() {
    var btnClass = ClassName({
      'confirmed': this.state.buttonOK,
    });

    {/* onHover={ this.showPassword.bind(this) }*/}
    return (
      <tr className="big">
        <td>{ atob(this.props.identifier) }</td>
        <td ref={ atob(this.props._key)  } className="password">
          <span>{ atob(this.props.password) }</span>
        </td>
        <td>
          <span className="btn-group right">
            <button
              id="cpy"
              className={ btnClass }
              data-clipboard-action="copy"
              data-clipboard-text={ this.props.password }
              data-small data-outline
              onClick={ this.confirmCopy.bind(this) }
            >
              <i className="fa fa-clipboard"/>
            </button>

            <button
              className="btn"
              type="red"
              data-small
              data-outline
              onClick={ this.deleteEntry.bind(this, this.props) }
            >
              <i className="fa fa-trash" />
            </button>
          </span>
        </td>
      </tr>
    )
  }
}

export { PasswordList, PasswordListAdd }
