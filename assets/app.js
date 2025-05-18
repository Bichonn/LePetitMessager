import { registerReactControllerComponents } from '@symfony/ux-react';
import { startStimulusApp } from '@symfony/stimulus-bridge';
import './bootstrap.js';
import './styles/app.css';
import './styles/dark-mode.css';
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import React from 'react';
import { ThemeProvider } from './react/contexts/ThemeContext.jsx';

registerReactControllerComponents(require.context('./react/controllers', true, /\.(j|t)sx?$/), (Component) => {
  return (props) => (
    <ThemeProvider>
      <Component {...props} />
    </ThemeProvider>
  );
});

console.log('App initialized successfully! 🎉');