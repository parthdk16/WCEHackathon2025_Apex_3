// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Accordion_styles } from './components/Accordion_styles';
import {SignIn} from './components/AuthenticationPage'
import {SignUpForm} from './components/SignUpForm';
import { Dashboard } from './components/Dashboard';
import { UploadDataset } from './components/UploadDataset';
import { ThemeProvider } from "@/components/theme-provider";
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './components/404';
import BookOrders from './components/FileUpload';
import FileUpload from './components/UploadFile';

const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <Router>
        <Routes>
          <Route path="/" element={<Accordion_styles />} />
          <Route path="/login" element={<SignIn/>} />
          <Route path="/signup" element={<SignUpForm/>} />
          <Route path="/upload" element={<FileUpload/>} />
          {/* <Route path="/dashboard" element={<Dashboard/>}/> */}
          <Route path="/upload-dataset" element={<UploadDataset/>} />
          {/* Add more routes as needed */}
          <Route path="/login" element={  <SignIn/> } />
          <Route path="/signup" element={ <SignUpForm/>} />
          <Route path="/page-not-found" element={ <NotFound/>} />
          <Route path="/file-upload" element={<BookOrders/>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/*" element={<NotFound/>} />
        </Routes>
    </Router>
    </ThemeProvider>
  );
};

export default App;
