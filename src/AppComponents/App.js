import React from 'react';
import axios from './../axios';

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.uploadActivity = this.uploadActivity.bind(this);
    }

    uploadActivity(e) {
        var formData = new FormData();
        formData.append('file', e.target.files[0]);

        axios.post('/uploadActivity', formData).then((resp) => {
            console.log(resp.data);
        }).catch((err) => {
            console.log(err);
        });
    }

    render() {
        return (
                <div id='root'>
                    <header>
                        STRIVE
                        <ul>
                            <li><label htmlFor='activity-input'>Upload Activity</label><input type='file' id='activity-input' onChange={this.uploadActivity} /></li>
                        </ul>
                    </header>
                    {this.props.children}
                </div>
        );
    }
}
