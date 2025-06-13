import React, { useState, useEffect, useCallback } from 'react';

/**
 * Component for viewing and managing post reports in admin dashboard
 */
export default function PostReportsView() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch post reports from API
    const fetchPostReports = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/admin/api/post-reports'); 
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Erreur HTTP: ${response.status}` }));
                throw new Error(errorData.message);
            }
            const data = await response.json();
            setReports(data.reports || data); // Handle different API response structures
            setError(null);
        } catch (err) {
            setError(err.message);
            setReports([]);
            console.error("Error fetching post reports:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load reports on component mount
    useEffect(() => {
        fetchPostReports();
    }, [fetchPostReports]);

    // Handle report deletion with confirmation
    const handleDeleteReport = async (reportId) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le signalement de post ID ${reportId} ?`)) {
            try {
                const response = await fetch(`/admin/api/post-reports/${reportId}`, { 
                    method: 'DELETE',
                    // Add necessary headers for authentication or CSRF token
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Erreur lors de la suppression du signalement.' }));
                    throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
                }
                
                alert('Signalement de post supprimé avec succès.');
                fetchPostReports(); // Refresh the list after deletion
            } catch (err) {
                alert(`Erreur: ${err.message}`);
                console.error("Error deleting post report:", err);
            }
        }
    };

    // Loading state
    if (loading) return (
        <div className="p-3 text-center">
            Chargement des signalements de posts...
        </div>
    );

    // Error state
    if (error) return (
        <div className="p-3">
            <div className="alert alert-danger">Erreur lors du chargement des signalements de posts: {error}</div>
        </div>
    );

    // Empty state when no reports found
    if (reports.length === 0) return (
        <div className="p-3 text-center">
            Aucun signalement de post à afficher.
        </div>
    );

    return (
        <div className="table-responsive border border-dark">
            <table className="table table-striped table-hover mb-0">
                <thead className="table-dark">
                    <tr>
                        <th>ID Signalement</th>
                        <th>Post ID</th>
                        <th>Signalé par</th>
                        <th>Auteur du Post</th>
                        <th>Raison</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.map(report => (
                        <tr key={report.id}>
                            <td>{report.id}</td>
                            <td>{report.post_id}</td>
                            <td>{report.reporter_username || 'N/A'}</td>
                            <td>{report.post_author_username || 'N/A'}</td>
                            <td>{report.reason}</td>
                            <td>{new Date(report.created_at).toLocaleDateString()}</td>
                            <td>
                                {/* Delete report button */}
                                <button 
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDeleteReport(report.id)}
                                >
                                    Supprimer
                                </button>
                                {/* Additional actions can be added here */}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}