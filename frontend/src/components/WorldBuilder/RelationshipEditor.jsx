import React, { useState, useCallback } from 'react';
import styles from '../../styles/components/styles';

const RelationshipEditor = ({ relationships = [], allCharacters = [], onUpdate }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [isCustomType, setIsCustomType] = useState(false);
    const [isCustomStatus, setIsCustomStatus] = useState(false);
    const [newRelationship, setNewRelationship] = useState({
        character_id: '',
        type: 'friend',
        status: 'neutral',
        description: ''
    });

    const relationshipTypes = [
        'acquaintance', 'ally', 'child', 'colleague', 'employee', 'employer',
        'enemy', 'family', 'friend', 'mentor', 'parent', 'rival', 'romantic',
        'sibling', 'stranger', 'student'
    ];

    const statusOptions = [
        'casual', 'complicated', 'distant', 'friendly', 'hostile', 'intimate',
        'missing', 'neutral', 'professional', 'strong', 'weak'
    ];

    // Helper function to get all relationship types (predefined only)
    const getAllRelationshipTypes = () => {
        return relationshipTypes.sort();
    };

    // Helper function to get all status options (predefined only)  
    const getAllStatusOptions = () => {
        return statusOptions.sort();
    };

    const handleAddRelationship = () => {
        if (!newRelationship.character_id || !newRelationship.type) return;

        const updatedRelationships = [...relationships, {
            character_id: newRelationship.character_id,
            type: newRelationship.type,
            status: newRelationship.status,
            description: newRelationship.description
        }];

        onUpdate(updatedRelationships);
        setNewRelationship({ character_id: '', type: 'friend', status: 'neutral', description: '' });
        setIsCustomType(false);
        setIsCustomStatus(false);
        setShowAddForm(false);
    };

    const handleRemoveRelationship = (index) => {
        const updatedRelationships = relationships.filter((_, i) => i !== index);
        onUpdate(updatedRelationships);
    };

    const handleUpdateRelationship = useCallback((index, field, value) => {
        const updatedRelationships = [...relationships];
        updatedRelationships[index] = {
            ...updatedRelationships[index],
            [field]: value
        };
        onUpdate(updatedRelationships);
    }, [relationships, onUpdate]);

    const getCharacterName = (character_id) => {
        const character = allCharacters.find(c => c.id === character_id);
        return character ? character.name : character_id;
    };

    return (
        <div style={styles.formGroup}>
            <label style={styles.label}>Relationships</label>

            {/* Existing relationships */}
            <div style={{ marginBottom: '20px' }}>
                {relationships.length === 0 ? (
                    <div style={{
                        border: '2px dashed #ccc',
                        borderRadius: '8px',
                        padding: '30px',
                        textAlign: 'center',
                        backgroundColor: '#f8f9fa',
                        color: '#666'
                    }}>
                        <p style={{ margin: '0', fontSize: '16px', fontStyle: 'italic' }}>
                            No relationships defined yet
                        </p>
                        <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
                            Click "Add Relationship" below to get started
                        </p>
                    </div>
                ) : (
                    <div>
                        <h4 style={{
                            margin: '0 0 15px 0',
                            color: '#333',
                            fontSize: '16px',
                            fontWeight: '600',
                            borderBottom: '2px solid #007bff',
                            paddingBottom: '5px'
                        }}>
                            Current Relationships ({relationships.length})
                        </h4>
                        {relationships.map((rel, index) => (
                            <div key={index} style={{
                                border: '2px solid #e9ecef',
                                borderRadius: '8px',
                                padding: '20px',
                                marginBottom: '15px',
                                backgroundColor: '#ffffff',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                transition: 'all 0.2s ease'
                            }}>
                                {/* Character Selection */}
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: '#333',
                                        fontSize: '14px'
                                    }}>Character</label>
                                    <select
                                        style={{
                                            ...styles.input,
                                            width: '100%',
                                            padding: '12px 15px',
                                            fontSize: '14px',
                                            minHeight: '45px',
                                            marginBottom: '0'
                                        }}
                                        value={rel.character_id || ''}
                                        onChange={(e) => handleUpdateRelationship(index, 'character_id', e.target.value)}
                                    >
                                        <option value="">Select Character</option>
                                        {allCharacters.map(char => (
                                            <option key={char.id} value={char.id}>
                                                {char.name} ({char.id})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Type and Status Row */}
                                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '600',
                                            color: '#333',
                                            fontSize: '14px'
                                        }}>Relationship Type</label>
                                        {relationshipTypes.includes(rel.type) ? (
                                            <select
                                                style={{
                                                    ...styles.input,
                                                    width: '100%',
                                                    padding: '12px 15px',
                                                    fontSize: '14px',
                                                    marginBottom: '0'
                                                }}
                                                value={rel.type || 'friend'}
                                                onChange={(e) => {
                                                    if (e.target.value === '__custom__') {
                                                        handleUpdateRelationship(index, 'type', 'Custom Type');
                                                    } else {
                                                        handleUpdateRelationship(index, 'type', e.target.value);
                                                    }
                                                }}
                                            >
                                                {getAllRelationshipTypes().map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                                <option value="__custom__">Custom...</option>
                                            </select>
                                        ) : (
                                            <input
                                                style={{
                                                    ...styles.input,
                                                    width: '100%',
                                                    padding: '12px 15px',
                                                    fontSize: '14px',
                                                    marginBottom: '0'
                                                }}
                                                value={rel.type || ''}
                                                onChange={(e) => handleUpdateRelationship(index, 'type', e.target.value)}
                                                placeholder="Custom relationship type"
                                            />
                                        )}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '600',
                                            color: '#333',
                                            fontSize: '14px'
                                        }}>Relationship Status</label>
                                        {statusOptions.includes(rel.status) ? (
                                            <select
                                                style={{
                                                    ...styles.input,
                                                    width: '100%',
                                                    padding: '12px 15px',
                                                    fontSize: '14px',
                                                    marginBottom: '0'
                                                }}
                                                value={rel.status || 'neutral'}
                                                onChange={(e) => {
                                                    if (e.target.value === '__custom__') {
                                                        handleUpdateRelationship(index, 'status', 'Custom Status');
                                                    } else {
                                                        handleUpdateRelationship(index, 'status', e.target.value);
                                                    }
                                                }}
                                            >
                                                {getAllStatusOptions().map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                                <option value="__custom__">Custom...</option>
                                            </select>
                                        ) : (
                                            <input
                                                style={{
                                                    ...styles.input,
                                                    width: '100%',
                                                    padding: '12px 15px',
                                                    fontSize: '14px',
                                                    marginBottom: '0'
                                                }}
                                                value={rel.status || ''}
                                                onChange={(e) => handleUpdateRelationship(index, 'status', e.target.value)}
                                                placeholder="Custom relationship status"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: '#333',
                                        fontSize: '14px'
                                    }}>Description</label>
                                    <input
                                        style={{
                                            ...styles.input,
                                            width: '100%',
                                            padding: '12px 15px',
                                            fontSize: '14px',
                                            marginBottom: '0'
                                        }}
                                        placeholder="Relationship description"
                                        value={rel.description || ''}
                                        onChange={(e) => handleUpdateRelationship(index, 'description', e.target.value)}
                                    />
                                </div>

                                {/* Summary and Remove Button */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingTop: '15px',
                                    borderTop: '1px solid #e9ecef'
                                }}>
                                    <div style={{
                                        fontSize: '14px',
                                        color: '#495057',
                                        fontStyle: 'italic',
                                        fontWeight: '500'
                                    }}>
                                        {rel.character_id ? getCharacterName(rel.character_id) : 'No character selected'}
                                        {rel.type ? ` is a ${rel.type}` : ''}
                                        {rel.status ? ` (${rel.status})` : ''}
                                    </div>
                                    <button
                                        style={{
                                            ...styles.button,
                                            backgroundColor: '#dc3545',
                                            color: 'white',
                                            padding: '8px 16px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onClick={() => handleRemoveRelationship(index)}
                                        onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                                        onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add new relationship */}
            {showAddForm ? (
                <div style={{
                    border: '2px dashed #007bff',
                    borderRadius: '4px',
                    padding: '15px',
                    backgroundColor: '#f8f9fa'
                }}>
                    <h4 style={{
                        margin: '0 0 15px 0',
                        color: '#007bff',
                        fontSize: '18px',
                        fontWeight: '600',
                        textAlign: 'center'
                    }}>Add New Relationship</h4>

                    {/* Character Selection */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontWeight: '500',
                            color: '#333'
                        }}>Character</label>
                        <select
                            style={{ ...styles.input, width: '100%' }}
                            value={newRelationship.character_id}
                            onChange={(e) => setNewRelationship({ ...newRelationship, character_id: e.target.value })}
                        >
                            <option value="">Select Character</option>
                            {allCharacters.map(char => (
                                <option key={char.id} value={char.id}>
                                    {char.name} ({char.id})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Relationship Type */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: '600',
                            color: '#333',
                            fontSize: '15px'
                        }}>Relationship Type</label>
                        {isCustomType ? (
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    style={{
                                        ...styles.input,
                                        flex: 1,
                                        marginBottom: 0,
                                        padding: '12px 15px',
                                        fontSize: '14px',
                                        minWidth: '200px'
                                    }}
                                    placeholder="Enter custom relationship type"
                                    value={newRelationship.type}
                                    onChange={(e) => setNewRelationship({ ...newRelationship, type: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCustomType(false);
                                        setNewRelationship({ ...newRelationship, type: 'friend' });
                                    }}
                                    style={{
                                        padding: '10px 15px',
                                        fontSize: '13px',
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        fontWeight: '500'
                                    }}
                                >
                                    Use Standard
                                </button>
                            </div>
                        ) : (
                            <select
                                style={{
                                    ...styles.input,
                                    width: '100%',
                                    marginBottom: 0,
                                    padding: '12px 15px',
                                    fontSize: '14px',
                                    minHeight: '45px'
                                }}
                                value={newRelationship.type}
                                onChange={(e) => {
                                    if (e.target.value === 'custom') {
                                        setIsCustomType(true);
                                        setNewRelationship({ ...newRelationship, type: '' });
                                    } else {
                                        setNewRelationship({ ...newRelationship, type: e.target.value });
                                    }
                                }}
                            >
                                {getAllRelationshipTypes().map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                                <option value="custom">Custom...</option>
                            </select>
                        )}
                    </div>

                    {/* Relationship Status */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: '600',
                            color: '#333',
                            fontSize: '15px'
                        }}>Relationship Status</label>
                        {isCustomStatus ? (
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    style={{
                                        ...styles.input,
                                        flex: 1,
                                        marginBottom: 0,
                                        padding: '12px 15px',
                                        fontSize: '14px',
                                        minWidth: '200px'
                                    }}
                                    placeholder="Enter custom relationship status"
                                    value={newRelationship.status}
                                    onChange={(e) => setNewRelationship({ ...newRelationship, status: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCustomStatus(false);
                                        setNewRelationship({ ...newRelationship, status: 'neutral' });
                                    }}
                                    style={{
                                        padding: '10px 15px',
                                        fontSize: '13px',
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        fontWeight: '500'
                                    }}
                                >
                                    Use Standard
                                </button>
                            </div>
                        ) : (
                            <select
                                style={{
                                    ...styles.input,
                                    width: '100%',
                                    marginBottom: 0,
                                    padding: '12px 15px',
                                    fontSize: '14px',
                                    minHeight: '45px'
                                }}
                                value={newRelationship.status}
                                onChange={(e) => {
                                    if (e.target.value === 'custom') {
                                        setIsCustomStatus(true);
                                        setNewRelationship({ ...newRelationship, status: '' });
                                    } else {
                                        setNewRelationship({ ...newRelationship, status: e.target.value });
                                    }
                                }}
                            >
                                {getAllStatusOptions().map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                                <option value="custom">Custom...</option>
                            </select>
                        )}
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontWeight: '500',
                            color: '#333'
                        }}>Description (Optional)</label>
                        <input
                            style={{ ...styles.input, width: '100%' }}
                            placeholder="Description (optional)"
                            value={newRelationship.description}
                            onChange={(e) => setNewRelationship({ ...newRelationship, description: e.target.value })}
                        />
                    </div>

                    <div style={{ marginTop: '15px', display: 'flex', gap: '12px' }}>
                        <button
                            style={{
                                ...styles.button,
                                backgroundColor: '#28a745',
                                fontSize: '16px',
                                fontWeight: '600',
                                padding: '12px 24px',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                flex: 1
                            }}
                            onClick={handleAddRelationship}
                            disabled={!newRelationship.character_id || !newRelationship.type}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
                        >
                            Add Relationship
                        </button>

                        <button
                            style={{
                                ...styles.button,
                                backgroundColor: '#6c757d',
                                fontSize: '16px',
                                fontWeight: '600',
                                padding: '12px 24px',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                flex: 1
                            }}
                            onClick={() => {
                                setShowAddForm(false);
                                setNewRelationship({ character_id: '', type: 'friend', status: 'neutral', description: '' });
                                setIsCustomType(false);
                                setIsCustomStatus(false);
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    style={{
                        ...styles.button,
                        backgroundColor: '#007bff',
                        width: '100%',
                        fontSize: '16px',
                        fontWeight: '600',
                        padding: '14px 20px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 4px rgba(0,123,255,0.2)',
                        marginTop: '10px'
                    }}
                    onClick={() => setShowAddForm(true)}
                    onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#0056b3';
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 8px rgba(0,123,255,0.3)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#007bff';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 4px rgba(0,123,255,0.2)';
                    }}
                >
                    + Add Relationship
                </button>
            )}
        </div>
    );
};

export default RelationshipEditor;