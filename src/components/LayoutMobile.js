'use strict';

import React from 'react';
import { Link } from 'react-router';

export default class LayoutMobile extends React.Component {
  render() {
    return (
      <div className="app-container">
      
        <div className="app-content">{this.props.children}</div>

      </div>
    );
  }
}