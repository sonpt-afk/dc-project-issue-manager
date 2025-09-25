import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { getProjectKey, getIsEnabled } from '../../helper/ApiUtils'; // Corrected path

const SettingsPage = () => {
    const [projectKey, setProjectKey] = useState('');
    const [isEnabled, setIsEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const key = getProjectKey();
        const enabled = getIsEnabled();
        setProjectKey(key);
        setIsEnabled(enabled);
        setLoading(false);
    }, []);

    const handleToggle = () => {
        setIsEnabled(!isEnabled);
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage('');
        try {
            const response = await fetch(`/plugins/servlet/project-settings?projectKey=${projectKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `isEnabled=${!isEnabled}`, // Send the toggled state
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                setIsEnabled(data.isEnabled);
                setMessage('Settings saved successfully!');
            } else {
                setMessage('Failed to save settings.');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage('Error saving settings.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="project-settings-container">
            <h2>Project app Settings</h2>
            <div className="field-group">
                <label htmlFor="enable-app-toggle">Enable app for project {projectKey}</label>
                <div className="toggle-switch">
                    <input
                        type="checkbox"
                        id="enable-app-toggle"
                        checked={isEnabled}
                        onChange={handleToggle}
                        className="toggle-switch-checkbox"
                    />
                    <label
                        htmlFor="enable-app-toggle"
                        className="toggle-switch-label"
                    >
                        <span className="toggle-switch-inner"></span>
                        <span className="toggle-switch-switch"></span>
                    </label>
                </div>
            </div>
            <div className="buttons-container">
                <button className="aui-button aui-button-primary" onClick={handleSave} disabled={loading}>
                    Save Settings
                </button>
            </div>
            {message && <p>{message}</p>}
        </div>
    );
};

// Render the component
const container = document.getElementById('project-settings-app');
if (container) {
    ReactDOM.render(<SettingsPage />, container);
}
