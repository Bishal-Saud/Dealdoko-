import React from 'react'
import { Routes, Route } from 'react-router-dom'

import HomePage from './Pages/HomePage.jsx'
import ProfilePage from './Pages/ProfilePage.jsx'
import VerificationPage from './Pages/VeificationPage.jsx'
import UsersPage from './Pages/UsersPage.jsx'
import RolePage from './Pages/RolePage.jsx'
import SellerDashboardPage from './Pages/SellerDashboardPage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import ManageOrderPage from './Pages/ManageOrderPage.jsx'
import TermsAndPolicyPage from './Pages/TermsAndPolicyPage.jsx'
import AboutUsPage from './Pages/AboutUsPage.jsx'
import SettingsPage from './Pages/SettingsPage.jsx'

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