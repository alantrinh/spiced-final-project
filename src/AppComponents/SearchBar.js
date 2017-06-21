import React from 'react';
import axios from './../axios';

export default class SearchBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = ({searchTerm: ''});

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e) {
        this.setState({[e.target.name]: e.target.value});
    }

    handleSubmit(e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            if ((this.state.searchTerm.match(/ /g) || []).length > 1) {
                this.setState({
                    error: true,
                    errorMessage: 'Please enter two search items maximum'
                });
            } else {
                axios.get(`/athletes?q=${this.state.searchTerm ? this.state.searchTerm : 'all'}`).then((resp) => {
                    if (resp.data.success) {
                        this.props.setSearchResults(resp.data.data);
                    } else {
                        this.setState({
                            error: true,
                            errorMessage: resp.data.errorMessage
                        });
                    }
                    this.setState({
                        searchTerm: ''
                    });
                }).catch((err) => {
                    console.log(err);
                });
            }
        }
    }

    render() {
        return (
            <div>
                <input type='search' name='searchTerm' placeholder='Search for other athletes' value={this.state.searchTerm} onChange={this.handleChange} onKeyDown={this.handleSubmit} />
                <span id='search-close' onClick={this.props.toggleSearch}>&#10006;</span>
                {this.state.error && <div className="error"> {this.state.errorMessage}</div>}
            </div>
        );
    }
}
