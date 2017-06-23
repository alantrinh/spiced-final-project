import React from 'react';
import axios from './../axios';
import {browserHistory, Link} from 'react-router';

export default class Activity extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.params.id,
            showEdit: false,
            showKudosGivers: false,
            showCommentBox: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.toggleEditFields = this.toggleEditFields.bind(this);
        this.updateActivity = this.updateActivity.bind(this);
        this.giveKudos = this.giveKudos.bind(this);
        this.removeKudos = this.removeKudos.bind(this);
        this.showKudosGivers = this.showKudosGivers.bind(this);
        this.hideKudosGivers = this.hideKudosGivers.bind(this);
        this.deleteActivity = this.deleteActivity.bind(this);
        this.toggleCommentBox = this.toggleCommentBox.bind(this);
        this.addComment = this.addComment.bind(this);
        this.getComments = this.getComments.bind(this);
    }

    componentDidMount() {
        axios.get(`/activity?id=${this.state.id}`).then((resp) => {
            this.setState(resp.data.data);
            this.setState({ownActivity: resp.data.ownActivity});
        });

        axios.get(`/hasAlreadyGivenKudos?id=${this.state.id}`).then((resp) => {
            if (resp.data) {
                this.setState({kudosAlreadyGiven: true});
            } else {
                this.setState({kudosAlreadyGiven: false});
            }
        });

        axios.get(`/getKudosCount?id=${this.state.id}`).then((resp) => {
            this.setState(resp.data);
        });

        this.getComments();
    }

    toggleEditFields() {
        this.setState(prevState => ({
            showEdit: !prevState.showEdit
        }));
    }

    handleChange(e) {
        this.setState({[e.target.name]: e.target.value});
    }

    updateActivity(e) {
        e.preventDefault();
        const {id, title, description} = this.state;
        axios.post('/updateActivity', {
            id, title, description
        }).then((resp) => {
            this.setState(resp.data.data);
            this.toggleEditFields();
        });
    }

    giveKudos() {
        axios.post(`/giveKudos?id=${this.state.id}`).then(() => {
            axios.get(`/getKudosCount?id=${this.state.id}`).then((resp) => {
                this.setState({
                    count: resp.data.count,
                    kudosAlreadyGiven: true
                });
            });
        });
    }

    removeKudos() {
        axios.post(`/removeKudos?id=${this.state.id}`).then(() => {
            axios.get(`/getKudosCount?id=${this.state.id}`).then((resp) => {
                this.setState({
                    count: resp.data.count,
                    kudosAlreadyGiven: false
                });
            });
        });
    }

    showKudosGivers() {
        axios.get(`/getKudosGivers?id=${this.state.id}`).then((resp) => {
            this.setState({
                showKudosGivers: true,
                kudosGivers: resp.data.data
            });
        });
    }

    hideKudosGivers() {
        this.setState({showKudosGivers: false});
    }

    deleteActivity() {
        console.log('click');
        axios.post(`/deleteActivity?id=${this.state.id}`).then(() => {
            browserHistory.push('/');
        });
    }

    toggleCommentBox() {
        this.setState(prevState => ({
            showCommentBox: !prevState.showCommentBox
        }));
    }

    addComment(e) {
        e.preventDefault();
        const comment = this.state;
        axios.post(`/addComment?id=${this.state.id}`, comment).then(() => {
            this.toggleCommentBox();
            this.getComments();
        });
    }

    getComments() {
        axios.get(`/getComments?id=${this.state.id}`).then((resp) => {
            if(resp.data.data) {
                this.setState({comments: resp.data.data});

                console.log(this.state.comments);
            }
        });
    }

    render() {
        let activity = '';
        let kudosGivers = '';
        let comments = '';

        if (this.state.kudosGivers) {
            kudosGivers = this.state.kudosGivers.map((kudosGiver) => {
                return (
                    <div className='kudos-giver'>
                        <div>
                            <img className='feed-profile-image' src={kudosGiver['image_url'] ? kudosGiver['image_url'] : '/public/images/profile_placeholder.jpg'} />
                        </div>
                        <div>
                            <Link to={'/athlete/' + kudosGiver.id}>{kudosGiver.first_name} {kudosGiver.last_name}</Link><br />
                            <div>{kudosGiver.city}{kudosGiver.city && kudosGiver.state && ', '}{kudosGiver.state}{(kudosGiver.city || kudosGiver.state) && ', '}{kudosGiver.country}</div>
                        </div>
                    </div>
                );
            });
        }

        if (this.state.comments) {
            comments = this.state.comments.map((comment) => {
                return (
                    <div className='comment'>
                        <div className='comment-details-wrapper'>
                            <img className='feed-profile-image' src={comment['image_url'] ? comment['image_url'] : '/public/images/profile_placeholder.jpg'} />
                            <p><Link to={'/athlete/' + comment.id}>{comment.first_name} {comment.last_name}</Link> <span className='comment-text'>{comment.comment}</span><br />
                            <span className='comment-details-date'>{new Date(comment.created_at).toLocaleString()}</span></p>
                        </div>
                    </div>
                );
            });
        }

        if (this.state.first_name) {
            activity = (
                <div id='activity-wrapper'>
                    <div id='activity-header'>
                        <h2>{this.state.first_name} {this.state.last_name}</h2>
                        <span>{this.state.kudosAlreadyGiven ?
                            <button title='Remove Kudos' onClick={this.removeKudos}>Remove Kudos</button>
                            :
                            <button title='Give Kudos' onClick={this.giveKudos}>Give Kudos</button>} {this.state.showKudosGivers ?
                                <span id='kudos-count' onClick={this.hideKudosGivers}>{this.state.count}</span>
                                :
                                <span id='kudos-count' onClick={this.showKudosGivers}>{this.state.count}</span>}

                            {this.state.showCommentBox ?
                                <button onClick={this.toggleCommentBox}>Hide Comment Box</button>
                                : <button onClick={this.toggleCommentBox}>Add Comment</button>}
                        </span>
                    </div>
                    <div id='activity'>
                            <div id='activity-panel'>
                                <img id='activity-profile-image' src={this.state['image_url'] ? this.state['image_url'] : '/public/images/profile_placeholder.jpg'} />
                                <div id='activity-panel-description'>
                                    <span id='activity-panel-date'>{(new Date(this.state['start_time'])).toLocaleString()}</span>
                                    {this.state.showEdit ?
                                        (<form>
                                            <input type='text' name='title' placeholder='title' value={this.state.title} onChange={this.handleChange}></input><br />
                                            <textarea type='text' rows='4' name='description' placeholder='description' value={this.state.description} onChange={this.handleChange}></textarea>
                                            <br />
                                            <button type='cancel' onClick={this.toggleEditFields}>Cancel</button>
                                            <button type='submit' onClick={this.updateActivity}>Save</button>
                                        </form>)
                                        :
                                        (<div>
                                            <h2>{this.state.title ? this.state.title : 'Ride'}</h2>
                                            <div id='activity-panel-description-text'>{this.state.description}</div>
                                            {this.state.ownActivity &&
                                                <div id='activity-panel-description-buttons'>
                                                    <button onClick={this.toggleEditFields}>Edit activity</button>
                                                    <button onClick={this.deleteActivity}>Delete activity</button>
                                                </div>}
                                        </div>)
                                    }
                                </div>
                            </div>

                            <div id='activity-details-wrapper'>
                                <div className='activity-details' id='activity-details-row-1'>
                                    <div>
                                        <h2>{Math.round(this.state.distance * 100) / 100}km</h2>
                                        <span className='activity-details-subtext'>Distance</span>
                                    </div>

                                    <div>
                                        <h2>{new Date(this.state['moving_time'] * 1000).toISOString().substr(11, 8)}</h2>
                                        <span className='activity-details-subtext'>Moving Time</span>
                                    </div>

                                    <div>
                                        <h2>{Math.round(this.state.elevation * 1000)}m</h2>
                                        <span className='activity-details-subtext'>Elevation</span>
                                    </div>
                                </div>
                                <div className='activity-details' id='activity-details-row-2'>
                                    <div>
                                        <h3>{this.state.weighted_avg_power}W</h3>
                                        <span className='activity-details-subtext'>Weighted Avg Power</span>
                                    </div>

                                    <div>
                                        <h3>{Math.round(this.state.total_work / 1000)}kJ</h3>
                                        <span className='activity-details-subtext'>Total Work</span>
                                    </div>

                                    <div></div>
                                </div>
                                <div id='activity-details-row-3'>
                                    <div></div>
                                    <div className='activity-details-row-3-heading'>Avg</div>
                                    <div className='activity-details-row-3-heading'>Max</div>
                                    <div>Speed</div>
                                    <div>{Math.round(this.state.avg_speed * 10) / 10}km/h</div>
                                    <div>{Math.round(this.state.max_speed * 10) / 10}km/h</div>
                                    <div>Heart Rate</div>
                                    <div>{this.state.avg_heart_rate}bpm</div>
                                    <div>{this.state.max_heart_rate}bpm</div>
                                    <div>Cadence</div>
                                    <div>{this.state.avg_cadence}</div>
                                    <div>{this.state.max_cadence}</div>
                                    <div>Power</div>
                                    <div>{this.state.avg_power}W</div>
                                    <div>{this.state.max_power}W</div>
                                    <div>Calories</div>
                                    <div>{this.state.calories}</div>
                                    <div></div>
                                    <div>Elapsed Time</div>
                                    <div>{new Date(this.state.elapsed_time * 1000).toISOString().substr(11, 8)}</div>
                                    <div></div>
                                </div>
                            </div>
                    </div>
                </div>
            );
        }

        return (
            <div>
                {activity}
                <div id='comment-wrapper'>
                    <h3>Comments</h3>
                    {this.state.showCommentBox ?
                        <form>
                            <textarea type='text' rows='4' name='comment' placeholder='add comment' value={this.state.comment} onChange={this.handleChange}></textarea><br />
                            <button type='submit' onClick={this.addComment}>Save</button>
                        </form>
                        : ''}
                    {comments}
                </div>
                {this.state.showKudosGivers ? <div id='kudos-wrapper'>These athletes gave kudos: <br /><div id='kudos-givers'>{kudosGivers}</div></div> : ''}
            </div>
        );
    }
}
