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
import AskedQuestionPage from './Pages/AskedQuestionPage.jsx'
import ContactSellerPage from './Pages/ContactSellerPage.jsx'
import EditProfilePage from './Pages/EditProfilePage.jsx'
import NotFound from './context/NotFound.jsx'

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="*" element={<NotFound />} />
        <Route path='/' element={<HomePage />} />
        <Route path='/profile' element={<ProfilePage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path='/verify' element={<VerificationPage />} />
        <Route path='/users' element={<UsersPage />} />
        <Route path='/role' element={<RolePage />} />
        <Route path='/terms-and-policy' element={<TermsAndPolicyPage />} />
        <Route path='/aboutus' element={<AboutUsPage />} />
        <Route path='/edit-profile' element={<EditProfilePage />} />
        <Route path='/recent-queries' element={<AskedQuestionPage />} />
        <Route path='/book-tutor/:courseId' element={<ContactSellerPage />} />

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