import React from 'react';
import axios from './../axios';
import {browserHistory} from 'react-router';
import FollowButton from './FollowButton';

export default class Athlete extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.params.id
        };
    }

    componentDidMount() {
        axios.get(`/athlete?id=${this.state.id}`).then((resp) => {
            if (resp.data.redirect) {
                browserHistory.push('/profile');
            } else {
                this.setState(resp.data.data);
            }
        });

        axios.get(`/getUserActivitySummary?id=${this.state.id}`).then((resp) => {
            this.setState(resp.data.data);
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.params.id != this.state.id) {
            this.setState({
                id: nextProps.params.id
            });
        }
    }

    render() {
        return (
            <div id='profile-wrapper'>
                <div>
                    <img className='profile-image' src={this.state['image_url'] ? this.state['image_url'] : '/public/images/profile_placeholder.jpg'} />
                    <div className='profile'>
                        <h2>{this.state['first_name']} {this.state['last_name']}</h2>
                        <p><div className='location-profile'>{this.state.city}{this.state.city && this.state.state && ', '}{this.state.state}{(this.state.city || this.state.state) && ', '}{this.state.country}</div></p>
                        <FollowButton id={this.state.id}/>
                    </div>
                </div>
                <div id='profile-activity-count'>
                    <h2>{this.state['activity_count']}</h2>
                    <span id='profile-total-activities'>Total Activities</span>
                </div>
            </div>
        );
    }
}
