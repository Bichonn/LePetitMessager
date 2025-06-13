import React, { useState, useEffect, useCallback } from 'react';
import '../../../styles/AdminDashboard.css';
import '../../../styles/app.css';
import AccountReportsView from './AccountReportsView';
import PostReportsView from './PostReportsView';

/**
 * Main component for admin dashboard with user management and report views
 */
export default function AdminDashboard() {
    // State management for data, loading, errors, and current view
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [csrfToken, setCsrfToken] = useState('');
    const [currentAdminId, setCurrentAdminId] = useState(null);
    const [viewMode, setViewMode] = useState('users'); // Modes: 'users', 'account_reports', 'post_reports'

    // Fetch users list from API
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/admin/api/users');
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            const data = await response.json();
            setUsers(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load initial data and handle view changes
    useEffect(() => {
        if (viewMode === 'users') {
            fetchUsers();
        }
        // Get current user ID for admin actions
        fetch('/user')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.id) {
                    setCurrentAdminId(data.id);
                }
            })
            .catch(err => console.error("Failed to fetch current user ID", err));
    }, [fetchUsers, viewMode]);

    // Handle user ban toggle
    const handleToggleBan = async (userId) => {
        try {
            const response = await fetch(`/admin/api/users/${userId}/toggle-ban`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors du changement de statut de bannissement.');
            }
            alert(data.message);
            fetchUsers();
        } catch (err) {
            alert(`Erreur: ${err.message}`);
        }
    };

    // Handle admin role toggle
    const handleToggleAdmin = async (userId) => {
        try {
            const response = await fetch(`/admin/api/users/${userId}/toggle-admin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors du changement de rôle admin.');
            }
            alert(data.message);
            fetchUsers();
        } catch (err) {
            alert(`Erreur: ${err.message}`);
        }
    };

    // Handle user deletion with confirmation
    const handleDeleteUser = async (userId, username) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${username} ? Cette action est irréversible.`)) {
            try {
                const response = await fetch(`/admin/api/users/${userId}/delete`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Erreur lors de la suppression.');
                }
                alert(data.message);
                fetchUsers();
            } catch (err) {
                alert(`Erreur: ${err.message}`);
            }
        }
    };

    // View mode switching functions
    const switchToUsersView = () => setViewMode('users');
    const switchToReportsView = () => setViewMode('reports');
    const switchToPostReportsView = () => setViewMode('post_reports');

    // Loading state for users view
    if (loading && viewMode === 'users') return (
        <div className="p-3 text-center">
            Chargement des utilisateurs...
        </div>
    );
    
    // Error state for users view
    if (error && viewMode === 'users') return ( 
        <div className="p-3">
            <div className="alert alert-danger">Erreur: {error}</div>
        </div>
    );

    return (
        <div>
            {/* Dashboard header */}
            <h2 className="mb-0 border-start border-bottom border-end border-dark p-3 text-center text-decoration-underline bg-color-search inner-shadow">
                Tableau de bord d'administration
            </h2>
            
            {/* Navigation buttons for different views */}
            <div className="p-3 text-center border border-dark d-flex justify-content-around">
                <button 
                    className={`btn ${viewMode === 'users' ? 'btn-primary' : 'btn-outline-secondary rounded-0'}`} 
                    onClick={switchToUsersView}
                >
                    Voir la liste des utilisateurs
                </button>
                <button 
                    className={`btn ${viewMode === 'reports' ? 'btn-primary' : 'btn-outline-secondary rounded-0'}`} 
                    onClick={switchToReportsView}
                >
                    Voir les signalements de comptes
                </button>
                <button 
                    className={`btn ${viewMode === 'post_reports' ? 'btn-primary' : 'btn-outline-secondary rounded-0'}`} 
                    onClick={switchToPostReportsView}
                >
                    Voir les signalements de posts
                </button>
            </div>

            {/* Conditional rendering based on current view mode */}
            {viewMode === 'users' ? (
                <div className="table-responsive border border-dark">
                    <table className="table table-striped table-hover mb-0">
                        <thead className="table-dark">
                            <tr>
                                <th>ID</th>
                                <th>Nom d'utilisateur</th>
                                <th>Email</th>
                                <th>Rôles</th>
                                <th>Banni</th>
                                <th>Créé le</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>{user.roles.join(', ')}</td>
                                    <td>{user.is_banned ? 'Oui' : 'Non'}</td>
                                    <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                                    <td>
                                        {/* Ban/unban toggle button */}
                                        <button
                                            className={`btn btn-sm me-1 mb-1 ${user.is_banned ? 'btn-success' : 'btn-warning'}`}
                                            onClick={() => handleToggleBan(user.id)}>
                                            {user.is_banned ? 'Débannir' : 'Bannir'}
                                        </button>
                                        {/* Admin role toggle button */}
                                        <button
                                            className={`btn btn-sm me-1 mb-1 ${user.roles.includes('ROLE_ADMIN') ? 'btn-warning' : 'btn-info'}`}
                                            onClick={() => handleToggleAdmin(user.id)}
                                            disabled={user.roles.includes('ROLE_ADMIN') && user.id === currentAdminId}>
                                            {user.roles.includes('ROLE_ADMIN') ? 'Retirer Admin' : 'Promouvoir Admin'}
                                        </button>
                                        {/* Delete user button */}
                                        <button
                                            className="btn btn-sm btn-danger mb-1"
                                            onClick={() => handleDeleteUser(user.id, user.username)}
                                            disabled={user.id === currentAdminId}
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : viewMode === 'reports' ? (
                <AccountReportsView />
            ) : viewMode === 'post_reports' ? (
                <PostReportsView />
            ) : null}
        </div>
    );
}