import React, { useState, useEffect, useCallback } from 'react';
import '../../../styles/AdminDashboard.css';
import '../../../styles/app.css';

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [csrfToken, setCsrfToken] = useState(''); // For actions like delete
    const [currentAdminId, setCurrentAdminId] = useState(null);

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

    useEffect(() => {
        fetchUsers();
        // Fetch current user ID
        fetch('/user') // Assuming this endpoint returns the current user's data including ID
            .then(res => {
                if (res.ok) return res.json();
                return null;
            })
            .then(data => {
                if (data && data.id) {
                    setCurrentAdminId(data.id);
                }
            })
            .catch(err => console.error("Failed to fetch current user ID", err));
        // Example: Fetch a general CSRF token if your app provides an endpoint for it
        // fetch('/api/csrf-token') // Replace with your actual CSRF token endpoint
        //     .then(res => res.json())
        //     .then(data => setCsrfToken(data.token))
        //     .catch(err => console.error("Failed to fetch CSRF token", err));
    }, [fetchUsers]);

    const handleToggleBan = async (userId) => {
        try {
            const response = await fetch(`/admin/api/users/${userId}/toggle-ban`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' /*, 'X-CSRF-TOKEN': csrfToken */ },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors du changement de statut de bannissement.');
            }
            alert(data.message);
            fetchUsers(); // Refresh users list
        } catch (err) {
            alert(`Erreur: ${err.message}`);
        }
    };

    const handleToggleAdmin = async (userId) => {
        try {
            const response = await fetch(`/admin/api/users/${userId}/toggle-admin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' /*, 'X-CSRF-TOKEN': csrfToken */ },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors du changement de rôle admin.');
            }
            alert(data.message);
            fetchUsers(); // Refresh users list
        } catch (err) {
            alert(`Erreur: ${err.message}`);
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${username} ? Cette action est irréversible.`)) {
            try {
                const response = await fetch(`/admin/api/users/${userId}/delete`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' /*, 'X-CSRF-TOKEN': csrfToken */ }, // Pass CSRF token if needed
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Erreur lors de la suppression.');
                }
                alert(data.message);
                fetchUsers(); // Refresh users list
            } catch (err) {
                alert(`Erreur: ${err.message}`);
            }
        }
    };

    if (loading) return (
        <div className="p-3 text-center">
            Chargement des utilisateurs...
        </div>
    );
    if (error) return ( 
        <div className="p-3">
            <div className="alert alert-danger">Erreur: {error}</div>
        </div>
    );

    return (
        <div>
            <h2 className="mb-0 border-start border-end border-dark p-3 text-center text-decoration-underline bg-color-search  inner-shadow">Tableau de bord d'administration</h2>
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
                                    <button
                                        className={`btn mb-1 ${user.is_banned ? 'btn-admin-unban' : 'btn-admin-ban'}`}
                                        onClick={() => handleToggleBan(user.id)}>
                                        {user.is_banned ? 'Débannir' : 'Bannir'}
                                    </button>
                                    <button
                                        className={`btn mb-1 ${user.roles.includes('ROLE_ADMIN') ? 'btn-admin-promote' : 'btn-admin-promote'}`}
                                        onClick={() => handleToggleAdmin(user.id)}
                                        disabled={user.roles.includes('ROLE_ADMIN') && user.id === currentAdminId}>
                                        {user.roles.includes('ROLE_ADMIN') ? 'Retirer Admin' : 'Promouvoir Admin'}
                                    </button>
                                    <button
                                        className="btn btn-admin-supp"
                                        onClick={() => handleDeleteUser(user.id, user.username)}
                                        disabled={user.id === currentAdminId} // prevent self-deletion
                                    >
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}