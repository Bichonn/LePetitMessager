import React from 'react';
import '../../../styles/ShowProfil.css';
import '../../../styles/app.css';
import FollowBtn from './btn_user/FollowBtn.jsx';

export default function UserProfileInfo({ user, onEditClick }) {
  if (!user) return null;

  return (
    <div className="profile-header-container border-start border-bottom border-end border-dark">
      <div className="banner-container border-bottom border-dark">
        {user.banner && (
          <img
            src={user.banner}
            alt="Banner"
            className="banner-image"
          />
        )}
      </div>

      <div className="profile-avatar-wrapper">
        <img
          src={user.avatar_url || '/default-avatar.png'}
          alt="avatar"
          className="rounded-circle profil-avatar"
        />
      </div>

      <div className="container p-4 profil-container shadow bg-color-search">
        <div className="profile-info-details">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h3 className="mb-1 fw-bold fst-italic">
                {user.username} {user.private_account && <i className="bi bi-lock-fill ms-1"></i>}
              </h3>
              <p className="text-muted fst-italic mb-2">
                {user.first_name} {user.last_name} -- Membre depuis le{' '}
                {new Date(user.created_at).toLocaleDateString()}
              </p>
              <FollowBtn userId={user.id} initialFollowed={user.followed_by_user} />
            </div>
            {onEditClick && (
              <button className="btn btn-primary" onClick={onEditClick}>
                Modifier le profil
              </button>
            )}
          </div>
        </div>
        {user.bio && (
          <p className="fst-italic mb-0 mt-2">
            {user.bio}
          </p>
        )}
      </div>
    </div>
  );
}