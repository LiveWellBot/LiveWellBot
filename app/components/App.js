import React from 'react';
import Footer from './Footer';
import ImageUpload from './ImageUpload';

class App extends React.Component {
  render() {
    return (
      <div>
          {this.props.children}
        <Footer />
      </div>
    );
  }
}

export default App;
