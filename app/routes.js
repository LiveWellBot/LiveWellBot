import React from 'react';
import {Route, IndexRoute} from 'react-router';
import App from './components/App';
import Home from './components/Home';
import ImageUpload from './components/ImageUpload';

export default (
  <Route path="/" component={App}>
    <IndexRoute component={ImageUpload} />
    <Route path="/pictures" component={Home} />
  </Route>
);
