import React from 'react';
import {Link} from 'react-router';

export default class Welcome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        let option = '';
        if (location.hash == '#/register') {
            option = (
                <div id='welcome-option'>
                    <Link to="/">Log In</Link>
                </div>);
        } else {
            option = (
                <div id='welcome-option'>
                    <Link to="/register">Sign Up</Link>
                </div>
            );
        }

        return (
            <div>
                <header>
                    <h1>STRAVITA</h1>
                    {option}
                </header>
                <div id='welcome-wrapper'>
                    <div id='welcome'>
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}
