import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './i18n'; // Import i18n configuration first
import App from './app/App';
import reportWebVitals from './reportWebVitals';
import { checkStudentSync } from './utils/checkStudentSync';
import ErrorBoundary from './components/ErrorBoundary';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Make checkStudentSync available globally for debugging
if (process.env.NODE_ENV === 'development') {
  (window as any).checkStudentSync = checkStudentSync;
  console.log('🔧 Dev mode: Type checkStudentSync() in console to check database sync');
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
