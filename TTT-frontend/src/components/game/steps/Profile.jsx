import React, { useState, useEffect } from 'react';
import "../../../StyleCSS/profile.css";
import { useUser } from "../../../state/UserContext";
import { useAuth } from "../../../state/AuthContext";
import { fetchWithAuth } from "../../../state/auth";

const Profile = ({ onBack }) => {
    const [userData, setUserData] = useState({
        username: localStorage.getItem('userName') || "Player",
        wins: 0,
        losses: 0,
        totalGames: 0,
        profileImage: null
    });
    const { user, refreshUser } = useUser();
    const { accessToken } = useAuth();

    const [loading, setLoading] = useState(true);
    const fileInputRef = React.useRef(null);

    const fetchProfileData = async () => {
        try {
            if (!accessToken) return;

            const response = await fetchWithAuth('/api/user/me', {
                method: 'GET',
                token: accessToken,
            });

            if (response.ok) {
                const data = await response.json();
                setUserData({
                    username: data.username,
                    wins: data.numberOfWins || 0,
                    losses: (data.totalGames - data.numberOfWins) || 0,
                    totalGames: data.totalGames || 0,
                    profileImage: data.profileImage
                });
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, [user]);

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;



        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetchWithAuth('/api/user/upload-image', {
                method: 'POST',
                body: formData,
                token: accessToken,
            });

            if (response.ok) {
                await refreshUser();
                await fetchProfileData();
            } else {
                const errorText = await response.text();
                console.error("Server error message:", errorText);
                alert("Upload failed: " + errorText);
            }
        } catch (error) {
            console.error("Network error:", error);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemoveImage = async () => {
        if (!window.confirm("Are u sure deleting the image?")) return;
        try {
            const response = await fetchWithAuth('/api/user/delete-image', {
                method: 'DELETE',
                token: accessToken,
            });

            if (response.ok) {
                await refreshUser();
            } else {
                alert("Error in deleting.");
            }
        } catch (error) {
            console.error("Network error during delete:", error);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const winRate = userData.totalGames > 0
        ? Math.round((userData.wins / userData.totalGames) * 100)
        : 0;

    return (
        <div className="profile-step-container fade-in-bottom">
            <div className="profile-dashboard">

                <div className="auth-card profile-info-card">
                    <div className="avatar-wrapper">
                        <label htmlFor="image-input" className="avatar-label">
                            {userData.profileImage ? (
                                <img
                                    src={`data:image/jpeg;base64,${userData.profileImage}`}
                                    alt="Avatar"
                                    className="profile-avatar-img"
                                />
                            ) : (
                                <div className="user-avatar-large">
                                    {userData.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="avatar-overlay">CHANGE PHOTO</div>
                        </label>
                        <input
                            id="image-input"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                        />
                    </div>
                    <div className="profile-actions">
                        {userData.profileImage && (
                            <button
                                className="base-btn btn-ghost"
                                onClick={handleRemoveImage}
                                style={{ color: '#ff4d4d', marginTop: '10px' }}
                            >
                                Remove Photo
                            </button>
                        )}
                    </div>

                    <h2 className="profile-username">{userData.username}</h2>
                    <p className="profile-role">THE MAN</p>

                    <div className="auth-actions" style={{marginTop: 'auto', width: '100%'}}>
                        <button className="base-btn btn-ghost" onClick={onBack}>
                            BACK TO MENU
                        </button>
                    </div>
                </div>

                <div className="auth-card profile-stats-card">
                    <h3 className="helptext">STATISTICS</h3>

                    {loading ? (
                        <div className="stat-label" style={{textAlign: 'center', width: '100%', marginTop: '20px'}}>
                            UPDATING STATS...
                        </div>
                    ) : (
                        <>
                            <div className="stats-display-grid">
                                <div className="stat-box">
                                    <span className="stat-label">TOTAL</span>
                                    <span className="stat-value">{userData.totalGames}</span>
                                </div>
                                <div className="stat-box highlight">
                                    <span className="stat-label">WINS</span>
                                    <span className="stat-value">{userData.wins}</span>
                                </div>
                                <div className="stat-box">
                                    <span className="stat-label">LOSSES</span>
                                    <span className="stat-value">{userData.losses}</span>
                                </div>
                            </div>

                            <div className="winrate-section">
                                <div className="winrate-info">
                                    <span>WIN RATE</span>
                                    <span style={{color: 'var(--primary)', fontWeight: 'bold'}}>{winRate}%</span>
                                </div>
                                <div className="winrate-track">
                                    <div
                                        className="winrate-fill"
                                        style={{ width: `${winRate}%` }}
                                    ></div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Profile;