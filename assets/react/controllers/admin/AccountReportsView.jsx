// filepath: assets/react/controllers/admin/AccountReportsView.jsx
import React, { useState, useEffect, useCallback } from 'react';

/**
 * AccountReportsView component fetches and displays account reports, allowing administrators to delete them.
 */
export default function AccountReportsView() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Fetches account reports from the API.
     * Updates the state with the reports data or an error message.
     */
    const fetchAccountReports = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/admin/api/account-reports');
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            const data = await response.json();
            setReports(data.reports || data); // Adapts to different API response structures
            setError(null);
        } catch (err) {
            setError(err.message);
            setReports([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAccountReports();
    }, [fetchAccountReports]);

    /**
     * Handles the deletion of a report.
     * @param {number} reportId - The ID of the report to delete.
     */
    const handleDeleteReport = async (reportId) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer le signalement ID ${reportId} ?`)) {
            try {
                const response = await fetch(`/admin/api/account-reports/${reportId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Erreur lors de la suppression du signalement.' }));
                    throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
                }

                setReports(prevReports => prevReports.filter(report => report.id !== reportId));
                alert('Signalement supprimé avec succès.');
            } catch (err) {
                console.error("Erreur lors de la suppression du signalement:", err);
                alert(`Erreur: ${err.message}`);
            }
        }
    };

    if (loading) return (
        <div className="p-3 text-center">
            Chargement des signalements de comptes...
        </div>
    );

    if (error) return (
        <div className="p-3">
            <div className="alert alert-danger">Erreur lors du chargement des signalements: {error}</div>
        </div>
    );

    if (reports.length === 0) return (
        <div className="p-3 text-center">
            Aucun signalement de compte à afficher.
        </div>
    );

    return (
        <div className="table-responsive border border-dark">
            <table className="table table-striped table-hover mb-0">
                <thead className="table-dark">
                    <tr>
                        <th>ID Signalement</th>
                        <th>Signalé par</th>
                        <th>Utilisateur signalé</th>
                        <th>Raison</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.map(report => (
                        <tr key={report.id}>
                            <td>{report.id}</td>
                            <td>{report.reporterUsername || report.fk_reporter?.username || 'N/A'}</td>
                            <td>{report.reportedUsername || report.fk_reported?.username || 'N/A'}</td>
                            <td>{report.content || report.reason || 'N/A'}</td>
                            <td>{report.created_at ? new Date(report.created_at).toLocaleDateString() : 'N/A'}</td>
                            <td>
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDeleteReport(report.id)}
                                >
                                    Supprimer
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}