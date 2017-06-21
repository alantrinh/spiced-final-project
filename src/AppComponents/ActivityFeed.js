import React from 'react';
import axios from './../axios';
import {Link} from 'react-router';

export default class ActivityFeed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        axios.get('/getFollowedActivities').then((resp) => {
            this.setState({activities: resp.data.data});

            // console.log(this.state.activities);
        });
    }

    render() {
        let activities = '';

        if (this.state.activities) {
            activities = this.state.activities.map((activity) => {
                return (
                    <div className='feed-activity' key={activity.id}>
                        <div>
                            <img className='feed-profile-image' src={activity['image_url'] ? activity['image_url'] : '/public/images/profile_placeholder.jpg'} />
                        </div>
                        <div>
                            {activity.first_name} {activity.last_name}<br />
                            {(new Date(activity['start_time'])).toLocaleString()}<br /><br />

                            <Link to={'/activity/' + activity.id}>{activity.title ? activity.title : 'Ride'}</Link><br />
                            <span>{Math.round(activity.distance * 100) / 100}km {Math.round(activity.elevation * 1000)}m</span>
                        </div>
                        <br />
                    </div>
                );
            });
        }


        return (
                <div id='activity-feed-wrapper'>
                    <h1>Activity Feed</h1>
                    {activities}
                </div>
        );
    }
}
