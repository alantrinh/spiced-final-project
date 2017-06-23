import React from 'react';
import axios from './../axios';
import {Link} from 'react-router';

export default class ActivityFeed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            myActivitiesOnly: false
        };

        this.toggleMyActivitiesOnly = this.toggleMyActivitiesOnly.bind(this);
    }

    componentDidMount() {
        axios.get('/getFollowedActivities').then((resp) => {
            this.setState({activities: resp.data.data});
        });
    }

    toggleMyActivitiesOnly(e) {
        this.setState(({
            myActivitiesOnly: e.target.value
        }), () => {
            if (this.state.myActivitiesOnly) {
                axios.get('/getUserActivities').then((resp) => {
                    this.setState({activities: resp.data.data});
                });
            } else {
                axios.get('/getFollowedActivities').then((resp) => {
                    this.setState({activities: resp.data.data});
                });
            }
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
                            <Link to={'/athlete/' + activity['user_id']}><span className='feed-name'>{activity.first_name} {activity.last_name}</span></Link><br />
                            <span className='feed-date'>{(new Date(activity['start_time'])).toLocaleString()}</span><br /><br />

                            <Link className='feed-activity-title' to={'/activity/' + activity.id}>{activity.title ? activity.title : 'Ride'}</Link><br />
                            <span className='feed-stats'>{Math.round(activity.distance * 100) / 100}km &nbsp;{Math.round(activity.elevation * 1000)}m</span>
                        </div>
                        <br />
                    </div>
                );
            });
        }


        return (
                <div id='activity-feed-wrapper'>
                    <div>
                        <h1>Activity Feed</h1>
                        <select id='feed-selector' onChange={this.toggleMyActivitiesOnly}>
                            <option value=''>I'm Following</option>
                            <option value='true'>My Activities</option>
                        </select>
                    </div>
                    {activities}
                </div>
        );
    }
}
