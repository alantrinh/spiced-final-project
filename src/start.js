import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, Link, IndexRoute, hashHistory, browserHistory} from 'react-router';
import Welcome from './WelcomeComponents/Welcome';
import Login from './WelcomeComponents/Login';
import Registration from './WelcomeComponents/Registration';
import App from './AppComponents/App';
import ActivityFeed from './AppComponents/ActivityFeed';
import Activity from './AppComponents/Activity';

const router = (
    <Router history={browserHistory}>
        <Route path='/' component={App}>
            <Route path='activity/:id' component={Activity} />
            <IndexRoute component={ActivityFeed} />
        </Route>
    </Router>
);

let elem = router;
if (location.pathname == '/welcome') {
    elem = (
        <Router history={hashHistory}>
            <Route path='/' component={Welcome}>
                <Route path='register' component={Registration} />
                <IndexRoute component={Login} />
            </Route>
        </Router>
    );
}

ReactDOM.render(
    elem,
    document.querySelector('main')
);
