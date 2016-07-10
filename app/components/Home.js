import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchImages } from '../actions/index';
import {Link} from 'react-router';

class Home extends React.Component {
  componentWillmount() {
    console.log('here is petchImages');
    //this.props.fetchImages();
  }

  renderImages() {
    return this.props.livewell.map((livewell) => {
      return (
        <div className="form-group col-sm-6 col-md-4">
          <div classname="thumbnail">
            <h3>{livewell.images.upload_date}</h3>
            <img src="livewell.images.data" />
            <p>weight: {livewell.images.weight}</p>
            <p>feeling: {livewell.images.feeling}</p>
          </div>
        </div>
      );
    });
  }
  render() {
      return (
        <div className="container">
          <h3>My Pictures</h3>
          <div className="row">
            {this.renderImages()}
          </div>
        </div>
      );
  }
}

export default Home;
