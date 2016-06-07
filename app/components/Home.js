import React from 'react';
import {Link} from 'react-router';
import HomeStore from '../stores/HomeStore';
import HomeActions from '../actions/HomeActions';

class Home extends React.Component {
  render() {
      console.log("home");
      return (
        <div className='container'>
          <p>Home</p>
        </div>
      );
  }
}

export default Home;
