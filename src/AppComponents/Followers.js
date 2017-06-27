import React from 'react';
import axios from './../axios';
import {Link} from 'react-router';
import FollowButton from './FollowButton';

export default class Followers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.acceptFriendRequest = this.acceptFriendRequest.bind(this);
        this.cancelFriendRequest = this.cancelFriendRequest.bind(this);
        this.unfriend = this.unfriend.bind(this);
    }

    componentDidMount() {
        axios.get(`/getReceivedFriendRequests`).then((resp) => {
            this.setState({
                receivedFriendRequests: resp.data.data
            });
        });

        axios.get('/getSentFriendRequests').then((resp) => {
            this.setState({
                sentFriendRequests: resp.data.data
            });
        });

        axios.get('/getFriends').then((resp) => {
            this.setState({
                friends: resp.data.data
            });
        });
    }

    acceptFriendRequest(e) {
        axios.post(`/acceptFriendRequest/${e.target.id}`).then((resp) => {
            if (resp.data.errorMessage) {
                console.log(resp.data.errorMessage);
            }
            axios.get(`/getReceivedFriendRequests`).then((resp) => {
                this.setState({
                    receivedFriendRequests: resp.data.data
                });
            });

            axios.get('/getFriends').then((resp) => {
                this.setState({
                    friends: resp.data.data
                });
            });
        });
    }

    cancelFriendRequest(e) {
        axios.post(`/cancelFriendRequest/${e.target.id}`).then((resp) => {
            if (resp.data.errorMessage) {
                console.log(resp.data.errorMessage);
            }
            axios.get('/getSentFriendRequests').then((resp) => {
                this.setState({
                    sentFriendRequests: resp.data.data
                });
            });
        });
    }

    unfriend(e) {
        axios.post(`/unfriend/${e.target.id}`).then((resp) => {
            if (resp.data.errorMessage) {
                console.log(resp.data.errorMessage);
            }
            axios.get('/getFriends').then((resp) => {
                this.setState({
                    friends: resp.data.data
                });
            });
        });
    }

    render() {
        let receivedFriendRequests = '';
        let sentFriendRequests = '';
        let friends = '';

        if (this.state.receivedFriendRequests) {
            receivedFriendRequests = this.state.receivedFriendRequests.map((receivedFriendRequest) => {
                return (
                    <div className='friend-request follower' key={receivedFriendRequest.id}>
                        <Link to={'/athlete/' + receivedFriendRequest['sender_id']}>
                            <img className='profile-image' src={receivedFriendRequest['image_url'] ? receivedFriendRequest['image_url'] : '/public/images/profile_placeholder.jpg'} />
                            <div><Link to={'/athlete/' + receivedFriendRequest.id}>{receivedFriendRequest['first_name']} {receivedFriendRequest['last_name']}</Link></div>
                        </Link><br />
                        <span className='follow-button' onClick={this.acceptFriendRequest} id={receivedFriendRequest['sender_id']}>
                            Accept Follow Request
                        </span>
                    </div>
                );
            });
        }

        if (this.state.sentFriendRequests) {
            sentFriendRequests = this.state.sentFriendRequests.map((sentFriendRequest) => {
                return (
                    <div className='friend-request-sent follower' key={sentFriendRequest.id}>
                        <Link to={'/athlete/' + sentFriendRequest['recipient_id']}>
                            <img className='profile-image' src={sentFriendRequest['image_url'] ? sentFriendRequest['image_url'] : '/public/images/profile_placeholder.jpg'} />
                            <div><Link to={'/athlete/' + sentFriendRequest['recipient_id']}>{sentFriendRequest['first_name']} {sentFriendRequest['last_name']}</Link></div>
                        </Link><br />
                        <span className='follow-button' onClick={this.cancelFriendRequest} id={sentFriendRequest['recipient_id']}>
                            Cancel Follow Request
                        </span>
                    </div>
                );
            });
        }

        if (this.state.friends) {
            // console.log(this.state.friends);
            friends = this.state.friends.map((friend) => {
                return (
                    <div className='follower' key={friend.id}>
                        <Link to={'/athlete/' + friend.id}>
                        <img className='profile-image' src={friend['image_url'] ? friend['image_url'] : '/public/images/profile_placeholder.jpg'} />
                        <div>{friend['first_name']} {friend['last_name']}</div>
                        </Link><br />
                        <span className='follow-button' onClick={this.unfriend} id={friend.id}>
                            Unfollow
                        </span>
                    </div>
                );
            });
        }

        return (
                <div id='followers-wrapper'>
                    {receivedFriendRequests.length != 0 && <div id='follow-requests'>
                        <h2>Follow Requests</h2>
                        {receivedFriendRequests}
                    </div>}
                    {sentFriendRequests.length != 0 && <div id='follow-requests-sent'>
                        <h2>Follow Requests Sent</h2>
                        {sentFriendRequests}
                    </div>}
                    {friends.length != 0 && <div id='followers'>
                        <h2>Followers</h2>
                        {friends}
                    </div>}
                </div>
        );
    }
}
