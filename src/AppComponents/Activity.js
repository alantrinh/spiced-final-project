import React from 'react';
import axios from './../axios';

export default class Activity extends React.Component {
    constructor(props) {
        super(props);
        this.state = {id: this.props.params.id};
    }

    componentDidMount() {
        axios.get(`/activity?id=${this.state.id}`).then((resp) => {
            this.setState({activity: resp.data.data});
        });
    }

    render() {
        let activity = '';

        if (this.state.activity) {
            activity = (
                <div id='activity'>
                        <div id='activity-panel'>
                            {(new Date(this.state.activity['start_time'])).toLocaleString()}<br />
                            {this.state.activity.title ? this.state.activity.title : 'Ride'}
                        </div>
                        <div id='activity-details-wrapper'>
                            <div className='activity-details' id='activity-details-row-1'>
                                <div>
                                    {Math.round(this.state.activity.distance * 100) / 100}km<br />
                                    Distance
                                </div>

                                <div>
                                    {new Date(this.state.activity['moving_time'] * 1000).toISOString().substr(11, 8)}<br />
                                    Moving Time
                                </div>

                                <div>
                                    {Math.round(this.state.activity.elevation * 100) / 100}m<br />
                                    Elevation
                                </div>
                            </div>
                            <div className='activity-details' id='activity-details-row-2'>
                                <div>
                                    {this.state.activity.weighted_avg_power}W<br />
                                    Weighted Avg Power
                                </div>

                                <div>
                                    {Math.round(this.state.activity.total_work / 1000)}kJ<br />
                                    Total Work
                                </div>

                                <div></div>
                            </div>
                            <div id='activity-details-row-3'>
                                <div></div>
                                <div>Avg</div>
                                <div>Max</div>
                                <div>Speed</div>
                                <div>{Math.round(this.state.activity.avg_speed * 10) / 10}km/h</div>
                                <div>{Math.round(this.state.activity.max_speed * 10) / 10}km/h</div>
                                <div>Heart Rate</div>
                                <div>{this.state.activity.avg_heart_rate}bpm</div>
                                <div>{this.state.activity.max_heart_rate}bpm</div>
                                <div>Cadence</div>
                                <div>{this.state.activity.avg_cadence}</div>
                                <div>{this.state.activity.max_cadence}</div>
                                <div>Power</div>
                                <div>{this.state.activity.avg_power}</div>
                                <div>{this.state.activity.max_power}</div>
                                <div>Calories</div>
                                <div>{this.state.activity.calories}</div>
                                <div></div>
                                <div>Elapsed Time</div>
                                <div>{new Date(this.state.activity.elapsed_time * 1000).toISOString().substr(11, 8)}</div>
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
