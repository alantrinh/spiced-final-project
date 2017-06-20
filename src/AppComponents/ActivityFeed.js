import React from 'react';
import axios from './../axios';
import {Link} from 'react-router';

export default class ActivityFeed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        axios.get('/getUserActivities').then((resp) => {
            this.setState({activities: resp.data.data});

            // console.log(this.state.data.data[0]);
        });
    }

    render() {
        let activities = '';

        if (this.state.activities) {
            activities = this.state.activities.map((activity) => {
                return (
                    <div className='profile-activity' key={activity.id}>

                        {(new Date(activity['start_time'])).toLocaleString()}<br />

                        <Link to={'/activity/' + activity.id}>{activity.title ? activity.title : 'Ride'}</Link>
                        <div>
                        {Math.round(activity.distance * 100) / 100}km<br />
                        {Math.round(activity.elevation * 1000)}m
                        </div>

                        <br />
                    </div>
                );
            });
        }


        return (
                <div id='profile-wrapper'>
                    <h1>Activity Feed</h1>
                    {activities}
                </div>
        );
    }
}
