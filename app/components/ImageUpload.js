import React, { Component, PropTypes } from "react";
import { Link } from 'react-router';
import { putImage } from '../actions/index';
import { reduxForm } from 'redux-form';

class ImageUpload extends Component {
  constructor(props) {
  super(props);

  this.state = {file: '',imagePreviewUrl: ''};
  }

  _handleSubmit(e) {
  e.preventDefault();
  console.log('handle uploading-', this.state.file);
  }

  _handleImageChange(e) {
    e.preventDefault();

    let reader = new FileReader();
    let file = e.target.files[0];

    reader.onloadend = () => {
      this.setState({
        file: file,
        imagePreviewUrl: reader.result
      });
    }

    reader.readAsDataURL(file);
  }

  render(){
    let {imagePreviewUrl} = this.state;
    let _imagePreview = null;
    if (imagePreviewUrl) {
      _imagePreview = (<img src={imagePreviewUrl} />);
    } else {
      _imagePreview = (<div className="previewText">Please select an Image for Preview</div>);
    }
    return (
      <div className='container'>
       <div className='row flipInX animated'>
         <div className='col-sm-8'>
           <div className='panel panel-default'>
             <div className='panel-heading'>Add Images</div>
             <div className='panel-body'>
               <form onSubmit={(e)=>this._handleSubmit(e)}>
                 <div className='form-group'>
                   <form>
                     <input type='file' className='form-control' onChange={(e)=>this._handleImageChange(e)}/>
                     <button type="submit" className="btn btn-primary pull-right" >Submit</button>
                     <span className='help-block'></span>
                   </form>
                 </div>
               </form>
               <div className="imgPreview">
                 {_imagePreview}
               </div>
               <Link to="/livewells" type='submit' className='btn btn-primary pull-right'>See Pictures</Link>
             </div>
           </div>
         </div>
       </div>
     </div>
    )
  }
}

export default ImageUpload;
