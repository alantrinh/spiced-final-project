import React from 'react';
import {browserHistory, Link} from 'react-router';

export default class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.props;
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.searchResults != this.state.searchResults) {
            this.setState({searchResults: nextProps.searchResults});
            browserHistory.push('/search');
        }
    }

    render() {
        let searchResults = '';

        if (this.state.searchResults) {
            searchResults = this.state.searchResults.map((searchResult) => {
                return (
                    <div className='search-result'>
                        <Link to={'/athlete/' + searchResult.id}>
                            <img src={searchResult['image_url'] ? searchResult['image_url'] : 'public/images/profile_placeholder.jpg'} />
                        </Link>
                        <div className='search-result-text'>
                            <Link to={'/athlete/' + searchResult.id}>
                                <div>{searchResult['first_name']} {searchResult['last_name']}</div>
                            </Link>
                            <div>{searchResult.city}{searchResult.city && searchResult.state && ', '}{searchResult.state}{(searchResult.city || searchResult.state) && ', '}{searchResult.country}</div>
                        </div>
                    </div>
                );
            });
        }

        return (
            <div id='search-results-wrapper'>
                <h1>Search Results</h1>
                {searchResults}
            </div>
        );
    }
}
