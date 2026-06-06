import React from 'react'
import { Routes, Route } from 'react-router-dom'

import HomePage from './Pages/Homepage'
import ProfilePage from './Pages/ProfilePage'
import VerificationPage from './Pages/VeificationPage'
import UsersPage from './Pages/UsersPage'
import RolePage from './Pages/RolePage'
import SellerDashboardPage from './Pages/SellerDashboardPage'
import ProtectedRoute from './components/ProtectedRoute'
import ManageOrderPage from './Pages/ManageOrderPage'
import TermsAndPolicyPage from './Pages/TermsAndPolicyPage'
import AboutUsPage from './Pages/AboutUsPage'
import SettingsPage from './Pages/SettingsPage'

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<HomePage />} />
        <Route path='/profile' element={<ProfilePage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path='/verify' element={<VerificationPage />} />
        <Route path='/users' element={<UsersPage />} />
        <Route path='/role' element={<RolePage />} />
        <Route path='/terms-and-policy' element={<TermsAndPolicyPage />} />
        <Route path='/aboutus' element={<AboutUsPage />} />
        <Route path='/settings' element={<SettingsPage />} />

        {/* Protected Merchant Console Routes */}
        <Route 
          path='/seller-dashboard' 
          element={
            <ProtectedRoute requireVerifiedSeller={true}>
              <SellerDashboardPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path='/manage-orders' 
          element={
            <ProtectedRoute requireVerifiedSeller={true}>
              <ManageOrderPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  )
}

export default App