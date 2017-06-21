import React from 'react';
import axios from './../axios';

export default class Activity extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.params.id,
            showEdit: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.toggleEditFields = this.toggleEditFields.bind(this);
        this.updateActivity = this.updateActivity.bind(this);
    }

    componentDidMount() {
        axios.get(`/activity?id=${this.state.id}`).then((resp) => {
            this.setState(resp.data.data);
            this.setState({ownActivity: resp.data.ownActivity});
        });
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

    render() {
        let activity = '';

        if (this.state.first_name) {
            activity = (
                <div id='activity'>
                        <div id='activity-panel'>
                            {this.state.first_name} {this.state.last_name}<br />
                            {(new Date(this.state['start_time'])).toLocaleString()}<br />
                            {this.state.showEdit ?
                                (<form>
                                    <input type='text' name='title' placeholder='title' value={this.state.title} onChange={this.handleChange}></input><br />
                                    <textarea type='text' name='description' placeholder='description' value={this.state.description} onChange={this.handleChange}></textarea>
                                    <br />
                                    <button type='cancel' onClick={this.toggleEditFields}>Cancel</button>
                                    <button type='submit' onClick={this.updateActivity}>Save</button>
                                </form>)
                                :
                                (<div>
                                    {this.state.title ? this.state.title : 'Ride'}
                                    <p>{this.state.description}</p>
                                    {this.state.ownActivity && <button onClick={this.toggleEditFields}>Edit activity</button>}    
                            </div>)
                            }
                        </div>
                        <div id='activity-details-wrapper'>
                            <div className='activity-details' id='activity-details-row-1'>
                                <div>
                                    {Math.round(this.state.distance * 100) / 100}km<br />
                                    Distance
                                </div>

                                <div>
                                    {new Date(this.state['moving_time'] * 1000).toISOString().substr(11, 8)}<br />
                                    Moving Time
                                </div>

                                <div>
                                    {Math.round(this.state.elevation * 100) / 100}m<br />
                                    Elevation
                                </div>
                            </div>
                            <div className='activity-details' id='activity-details-row-2'>
                                <div>
                                    {this.state.weighted_avg_power}W<br />
                                    Weighted Avg Power
                                </div>

                                <div>
                                    {Math.round(this.state.total_work / 1000)}kJ<br />
                                    Total Work
                                </div>

                                <div></div>
                            </div>
                            <div id='activity-details-row-3'>
                                <div></div>
                                <div>Avg</div>
                                <div>Max</div>
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
                                <div>{this.state.avg_power}</div>
                                <div>{this.state.max_power}</div>
                                <div>Calories</div>
                                <div>{this.state.calories}</div>
                                <div></div>
                                <div>Elapsed Time</div>
                                <div>{new Date(this.state.elapsed_time * 1000).toISOString().substr(11, 8)}</div>
                                <div></div>
                            </div>
                        </div>
                </div>
            );
        }

        return (
            <div>
                {activity}
            </div>
        );
    }
}
