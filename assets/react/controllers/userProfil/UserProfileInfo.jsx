import React from 'react';
import '../../../styles/ShowProfil.css';
import '../../../styles/app.css';
import FollowBtn from './btn_user/FollowBtn.jsx';

export default function UserProfileInfo({ user, onEditClick }) {
  if (!user) return null;

  const isOwnProfile = user.is_own_profile;

  return (
    <div className="profile-header-container border-start border-bottom border-end border-dark">
      {user.banner && (
        <div className="banner-container border-bottom border-dark">
          <img
            src={user.banner}
            alt="Banner"
            className="banner-image"
          />
        </div>
      )}

      {user.avatar_url && (
        <div className="profile-avatar-wrapper">
          <img
            src={user.avatar_url} // No fallback needed here as we only render if it exists
            alt="avatar"
            className="rounded-circle profil-avatar"
          />
        </div>
      )}

      <div className="container p-4 profil-container shadow bg-color-search">
        <div className="profile-info-details">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h3 className="mb-1 fw-bold fst-italic">
                {user.username} {user.private_account && <img src="/icons/cadenas.png" className="lock-icon-img ms-1" />}
              </h3>
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
              {(user.private_account && !isOwnProfile) && (
                <p className="text-muted fst-italic my-2">
                  {user.message || "Ce compte est privé."}
                </p>
              )}
              {!isOwnProfile && user.id && <FollowBtn userId={user.id} initialFollowed={user.followed_by_user} />}
            </div>
            {isOwnProfile && onEditClick && (
              <button className="btn btn-primary" onClick={onEditClick}>
                Modifier le profil
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}