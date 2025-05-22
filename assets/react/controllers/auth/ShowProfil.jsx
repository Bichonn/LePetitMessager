import React, { useState, useEffect } from 'react';

export default function ShowProfil() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUser = async () => {
        try {
            const response = await fetch(`/user`);
            const data = await response.json();
            setUser(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    if (isLoading) return <div>Chargement...</div>;
    if (error) return <div>Erreur: {error}</div>;
    if (!user) return <div>User non trouvé</div>;

    return (
        <div>
            <div>
                <h3>
                    {user.username} 
                </h3>
                <p>
                    Date de création: {new Date(user.created_at).toLocaleString()}
                    <br />
                    Prénom: {user.first_name}  Nom: {user.last_name}
                    <br />
                    Email: {user.email}
                    <br />
                    bio: {user.bio}
                </p>
            </div>

        </div>
    );
}
