import React from 'react';
import axios from './../axios';
import {browserHistory, Link} from 'react-router';
import SearchBar from './SearchBar';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showProfileMenu: false,
            showSearch: false
        };

        this.uploadActivity = this.uploadActivity.bind(this);
        this.toggleSearch = this.toggleSearch.bind(this);
        this.setSearchResults = this.setSearchResults.bind(this);
        this.setImage = this.setImage.bind(this);
        this.toggleProfileMenu = this.toggleProfileMenu.bind(this);
        this.logOut = this.logOut.bind(this);
    }

    componentDidMount() {
        axios.get('/athletes').then((resp) => {
            this.setState(resp.data);
        });
    }

    uploadActivity(e) {
        var formData = new FormData();
        formData.append('file', e.target.files[0]);

        axios.post('/uploadActivity', formData).then((resp) => {
            console.log(resp.data.data);
            this.toggleProfileMenu();
            browserHistory.push(`/activity/${resp.data.data.id}`);
        }).catch((err) => {
            console.log(err);
        });
    }

    toggleSearch() {
        this.setState(prevState => ({
            showSearch: !prevState.showSearch
        }));
    }

    setSearchResults(searchResults) {
        this.setState({
            searchResults: searchResults
        });
        browserHistory.push('/search');
    }

    setImage(url) {
        this.setState({imageUrl: url});
    }

    toggleProfileMenu() {
        this.setState(prevState => ({
            showProfileMenu: !prevState.showProfileMenu
        }));
    }

    logOut() {
        axios.get('/logOut').then(() => {
            location.href = '/welcome';
        });
    }

    render() {
        const children = React.cloneElement(this.props.children, {
            searchResults: this.state.searchResults,
            setImage: this.setImage
        });
        return (
            <div id='root'>
                <header>
                    <ul>
                        <li><Link to='/' onClick={this.state.showProfileMenu && this.toggleProfileMenu}><h1>STRAVITA</h1></Link></li>
                        <li>
                            {!this.state.showSearch && <img id='search-image' onClick={this.toggleSearch} title='Show Search Bar' src='/public/images/search.png' />}
                            {this.state.showSearch && <SearchBar setSearchResults={this.setSearchResults} toggleSearch={this.toggleSearch}/>}
                        </li>
                    </ul>

                    <div id='profile-menu-wrapper'>
                        <img id='navbar-profile-image' title='Profile Menu' onClick={this.toggleProfileMenu} src={this.state.imageUrl ? this.state.imageUrl : '/public/images/profile_placeholder.jpg'} />
                        {this.state.showProfileMenu &&
                            <ul id='profile-menu'>
                                <li><Link to='profile' onClick={this.toggleProfileMenu}>My Profile</Link></li>
                                <li><label htmlFor='activity-input'>Upload Activity</label><input type='file' id='activity-input' onChange={this.uploadActivity} /></li>
                                <li><Link to='followers' onClick={this.toggleProfileMenu}>Followers</Link></li>
                                <li onClick={this.logOut}>Log Out</li>
                            </ul>
                        }
                    </div>
                </header>
                {children}
            </div>
        );
    }
}
