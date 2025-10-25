import React, { useState, useCallback } from 'react';
import styles from '../../styles/components/styles';

const SkillsEditor = ({ skills, onUpdate }) => {
    const [newSkill, setNewSkill] = useState({ name: '', proficiency: 'novice' });
    const [isCustomSkill, setIsCustomSkill] = useState(false);
    const [isCustomProficiency, setIsCustomProficiency] = useState(false);

    const proficiencyLevels = [
        'novice',
        'apprentice',
        'competent',
        'proficient',
        'expert',
        'master',
        'legendary'
    ];

    const commonSkills = [
        'acrobatics', 'alchemy', 'animal handling', 'arcana', 'art', 'athletics',
        'combat', 'cooking', 'crafting', 'deception', 'diplomacy', 'engineering',
        'healing', 'history', 'insight', 'intimidation', 'investigation',
        'leadership', 'lockpicking', 'magic', 'medicine', 'music', 'nature',
        'perception', 'performance', 'persuasion', 'religion', 'sleight of hand',
        'stealth', 'survival', 'tactics', 'trading'
    ];

    // Helper function to get all skills (predefined only, sorted)
    const getAllSkills = () => {
        return commonSkills.sort();
    };

    // Helper function to get all proficiency levels (predefined only, sorted)
    const getAllProficiencyLevels = () => {
        return proficiencyLevels.sort();
    };

    const addSkill = () => {
        if (!newSkill.name.trim()) return;

        // Check for duplicate skills
        const existingSkill = skills.find(skill =>
            (typeof skill === 'string' ? skill : skill.name)?.toLowerCase() === newSkill.name.toLowerCase()
        );

        if (existingSkill) {
            alert('This skill already exists!');
            return;
        }

        const updatedSkills = [...skills, { ...newSkill }];
        onUpdate(updatedSkills);
        setNewSkill({ name: '', proficiency: 'novice' });
        setIsCustomSkill(false);
        setIsCustomProficiency(false);
    };

    const removeSkill = (index) => {
        const updatedSkills = skills.filter((_, i) => i !== index);
        onUpdate(updatedSkills);
    };

    const updateSkill = useCallback((index, field, value) => {
        const updatedSkills = [...skills];
        if (typeof updatedSkills[index] === 'string') {
            // Convert old string format to object
            updatedSkills[index] = { name: updatedSkills[index], proficiency: 'Competent' };
        }

        // Handle transition to custom proficiency mode
        if (field === 'proficiency' && value === '__custom__') {
            // Set a placeholder custom value that user can edit
            updatedSkills[index] = { ...updatedSkills[index], [field]: 'Custom Level' };
        } else {
            updatedSkills[index] = { ...updatedSkills[index], [field]: value };
        }
        onUpdate(updatedSkills);
    }, [skills, onUpdate]);    // Normalize skills to ensure they're all objects
    const normalizedSkills = skills.map(skill =>
        typeof skill === 'string'
            ? { name: skill, proficiency: 'Competent' }
            : skill
    );

    return (
        <div style={styles.formGroup}>
            <label style={styles.label}>Skills</label>

            {/* Existing Skills */}
            {normalizedSkills.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                    {normalizedSkills.map((skill, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '8px',
                            padding: '8px',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '4px'
                        }}>
                            <div style={{ flex: 2, marginRight: '8px' }}>
                                {getAllSkills().includes(skill.name) ? (
                                    <select
                                        style={{ ...styles.input, marginBottom: 0 }}
                                        value={skill.name || ''}
                                        onChange={(e) => {
                                            if (e.target.value === '__custom__') {
                                                updateSkill(index, 'name', 'Custom Skill');
                                            } else {
                                                updateSkill(index, 'name', e.target.value);
                                            }
                                        }}
                                    >
                                        <option value="">Select a skill...</option>
                                        {getAllSkills().map(skillName => (
                                            <option key={skillName} value={skillName}>{skillName}</option>
                                        ))}
                                        <option value="__custom__">Custom Skill</option>
                                    </select>
                                ) : (
                                    <input
                                        style={{ ...styles.input, marginBottom: 0 }}
                                        value={skill.name || ''}
                                        onChange={(e) => updateSkill(index, 'name', e.target.value)}
                                        placeholder="Custom skill name"
                                    />
                                )}
                            </div>
                            <div style={{ flex: 1, marginRight: '8px', position: 'relative' }}>
                                {getAllProficiencyLevels().includes(skill.proficiency) ? (
                                    <select
                                        style={{ ...styles.input, marginBottom: 0 }}
                                        value={skill.proficiency || 'novice'}
                                        onChange={(e) => {
                                            if (e.target.value === '__custom__') {
                                                updateSkill(index, 'proficiency', 'Custom Level');
                                            } else {
                                                updateSkill(index, 'proficiency', e.target.value);
                                            }
                                        }}
                                    >
                                        {getAllProficiencyLevels().map(level => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                        <option value="__custom__">Custom...</option>
                                    </select>
                                ) : (
                                    <input
                                        style={{ ...styles.input, marginBottom: 0 }}
                                        value={skill.proficiency || ''}
                                        onChange={(e) => updateSkill(index, 'proficiency', e.target.value)}
                                        placeholder="Custom proficiency level"
                                    />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => removeSkill(index)}
                                style={{
                                    ...styles.button,
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    padding: '4px 8px',
                                    fontSize: '12px',
                                    minWidth: 'auto'
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add New Skill */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '8px',
                padding: '8px',
                border: '2px dashed #ccc',
                borderRadius: '4px'
            }}>
                <select
                    style={{ ...styles.input, flex: 2, marginRight: '8px', marginBottom: 0 }}
                    value={isCustomSkill ? 'custom' : newSkill.name}
                    onChange={(e) => {
                        if (e.target.value === 'custom') {
                            setIsCustomSkill(true);
                            setNewSkill({ ...newSkill, name: '' });
                        } else {
                            setIsCustomSkill(false);
                            setNewSkill({ ...newSkill, name: e.target.value });
                        }
                    }}
                >
                    <option value="">Select a skill...</option>
                    {getAllSkills().map(skill => (
                        <option key={skill} value={skill}>{skill}</option>
                    ))}
                    <option value="custom">Custom Skill</option>
                </select>

                {isCustomSkill && (
                    <input
                        style={{ ...styles.input, flex: 2, marginRight: '8px', marginBottom: 0 }}
                        placeholder="Enter custom skill name"
                        value={newSkill.name}
                        onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    />
                )}

                <select
                    style={{ ...styles.input, flex: 1, marginRight: '8px', marginBottom: 0 }}
                    value={isCustomProficiency ? '__custom__' : newSkill.proficiency}
                    onChange={(e) => {
                        if (e.target.value === '__custom__') {
                            setIsCustomProficiency(true);
                            setNewSkill({ ...newSkill, proficiency: '' });
                        } else {
                            setIsCustomProficiency(false);
                            setNewSkill({ ...newSkill, proficiency: e.target.value });
                        }
                    }}
                >
                    {getAllProficiencyLevels().map(level => (
                        <option key={level} value={level}>{level}</option>
                    ))}
                    <option value="__custom__">Custom...</option>
                </select>

                {isCustomProficiency && (
                    <input
                        style={{ ...styles.input, flex: 1, marginRight: '8px', marginBottom: 0 }}
                        placeholder="Enter custom proficiency"
                        value={newSkill.proficiency}
                        onChange={(e) => setNewSkill({ ...newSkill, proficiency: e.target.value })}
                    />
                )}                <button
                    type="button"
                    onClick={addSkill}
                    disabled={!newSkill.name.trim()}
                    style={{
                        ...styles.button,
                        backgroundColor: newSkill.name.trim() ? '#007bff' : '#ccc',
                        color: 'white',
                        padding: '6px 12px',
                        fontSize: '12px',
                        minWidth: 'auto'
                    }}
                >
                    Add
                </button>
            </div>
        </div>
    );
};

export default SkillsEditor;