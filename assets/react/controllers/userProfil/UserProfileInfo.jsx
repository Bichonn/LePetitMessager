import React, { useState, useEffect } from 'react';
import '../../../styles/ShowProfil.css';
import '../../../styles/app.css';
import FollowBtn from './btn_user/FollowBtn.jsx';
import ReportBtn from './btn_user/ReportBtn.jsx';

/**
 * Component for displaying user profile information and action buttons
 */
export default function UserProfileInfo({ user, onEditClick }) {
  const isOwnProfile = user && user.is_own_profile;
  const [visitorIsAuthenticated, setVisitorIsAuthenticated] = useState(false);

  // Check if current visitor is authenticated
  useEffect(() => {
    fetch('/user')
      .then(response => {
        if (response.ok) {
          setVisitorIsAuthenticated(true);
        } else {
          setVisitorIsAuthenticated(false);
        }
      })
      .catch(() => {
        setVisitorIsAuthenticated(false);
      });
  }, []);

  // Loading state when no user data available
  if (!user) {
    return <div className="text-center p-3">Chargement des informations du profil...</div>;
  }

  const hasBanner = !!user.banner;

  return (
    <div className={`profile-header-container border-start border-bottom border-end border-dark ${!hasBanner ? 'no-banner-present' : ''}`}>
      {/* Banner image section */}
      {user.banner && (
        <div className="banner-container border-bottom border-dark">
          <img
            src={user.banner}
            alt="Banner"
            className="banner-image"
          />
        </div>
      )}

      {/* Profile avatar section */}
      {user.avatar_url && (
        <div className="profile-avatar-wrapper">
          <img
            src={user.avatar_url}
            alt="avatar"
            className={`rounded-circle profil-avatar ${!hasBanner ? 'avatar-no-banner' : 'avatar-with-banner'}`}
          />
        </div>
      )}

      {/* Main profile information container */}
      <div className="container p-4 profil-container shadow bg-color-search">
        <div className="profile-info-details">
          <div className="d-flex justify-content-between align-items-start">
            {/* Left side: User information */}
            <div>
              <h3 className="mb-1 fw-bold fst-italic">
                {user.username}
                {/* Premium badge for premium users */}
                {user.user_premium && (
                    <img
                        src="/icons/badge.svg"
                        alt="Premium"
                        title="Utilisateur Premium"
                        className="ms-2"
                        style={{ width: 18, height: 18, verticalAlign: 'middle' }}
                    />
                )}
                {/* Private account indicator for non-owners */}
                {user.private_account && !isOwnProfile && (
                  <img src="/icons/cadenas.png" className="lock-icon-img ms-1" alt="Profil privé"/>
                )}
              </h3>
              {/* Show detailed info for public profiles or own profile */}
              {(!user.private_account || isOwnProfile) && (
                <>
                  <p className="text-muted fst-italic mb-2">
                    {user.first_name} {user.last_name} -- Membre depuis le{' '}
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                  {user.bio && (
                    <p className="fst-italic mb-0 mt-2">
                      {user.bio}
                    </p>
                  )}
                </>
              )}
              {/* Show private message for private profiles viewed by others */}
              {(user.private_account && !isOwnProfile) && (
                <p className="text-muted fst-italic my-2">
                  {user.message || "Ce compte est privé."}
                </p>
              )}
            </div>
            {/* Right side: Action buttons */}
            <div className="d-flex flex-column align-items-end">
              {/* Edit profile button for own profile */}
              {isOwnProfile && onEditClick && (
                <button className="btn btn-primary mb-2" onClick={onEditClick}>
                  Modifier le profil
                </button>
              )}
              {/* Report and follow buttons for other users' profiles when authenticated */}
              {visitorIsAuthenticated && !isOwnProfile && user.id && (
                <>
                  <ReportBtn userId={user.id} username={user.username} />
                  <FollowBtn userId={user.id} initialFollowed={user.followed_by_user} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}