/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import ChatRoom from './pages/ChatRoom';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat/:roomId" element={<ChatRoom />} />
        </Routes>
      </Router>
      <Toaster position="top-center" />
    </AuthProvider>
  );
}

