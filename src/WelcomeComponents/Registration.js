import React from 'react';
import {Link} from 'react-router';
import axios from './../axios';

export default class Registration extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e) {
        this.setState({[e.target.name]: e.target.value});
    }

    handleSubmit(e) {
        e.preventDefault();
        const {firstName, lastName, email, password} = this.state;
        if (firstName == undefined) {
            this.setState({
                error: true,
                errorMessage: 'Please enter first name before submitting'
            });
        } else if (lastName == undefined) {
            this.setState({
                error: true,
                errorMessage: 'Please enter last name before submitting'
            });
        } else if (email == undefined) {
            this.setState({
                error: true,
                errorMessage: 'Please enter an email before submitting'
            });
        } else if (password == undefined) {
            this.setState({
                error: true,
                errorMessage: 'Please enter a password before submitting'
            });
        } else {
            axios.post('/registerAthlete', {
                firstName, lastName, email, password
            }).then((resp) => {
                if (resp.data.success) {
                    location.href = '/';
                } else {
                    this.setState({
                        error: true,
                        errorMessage: resp.data.errorMessage
                    });
                }
            }).catch((err) => {
                console.log(err);
            });
        }
    }

    render() {
        return (
            <div id='welcome-child'>
                <div>
                    <h2>Join us</h2>
                    {this.state.error && <div className="error"> {this.state.errorMessage}</div>}
                    <form onSubmit={this.handleSubmit}>
                        <p><input type="text" name="firstName" placeholder="First Name" value={this.state.firstName} onChange={this.handleChange}/></p>
                        <p><input type="text" name="lastName" placeholder="Last Name" value={this.state.lastName} onChange={this.handleChange} /></p>
                        <p><input type="text" name="email" placeholder="Email" value={this.state.email} onChange={this.handleChange} /></p>
                        <p><input type="password" name="password" placeholder="Password" value={this.state.password} onChange={this.handleChange} /></p>
                        <p><input type="submit" value="Submit" /></p>
                    </form>
                </div>
            </div>
        );
    }
}
