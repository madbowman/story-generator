import React from 'react';
import styles from './styles';

const WorldOverview = ({ data, updateField }) => (
  <div style={styles.form}>
    <h2 style={styles.sectionTitle}>World Overview</h2>
    <div style={styles.formGroup}>
      <label style={styles.label}>World Name</label>
      <input
        style={styles.input}
        value={data.name || ''}
        onChange={(e) => updateField('name', e.target.value)}
        placeholder="Enter world name"
      />
    </div>
    <div style={styles.formGroup}>
      <label style={styles.label}>Description</label>
      <textarea
        style={styles.textarea}
        value={data.description || ''}
        onChange={(e) => updateField('description', e.target.value)}
        placeholder="Brief description of your world"
        rows="4"
      />
    </div>
    <div style={styles.formGroup}>
      <label style={styles.label}>Time Period</label>
      <input
        style={styles.input}
        value={data.timePeriod || ''}
        onChange={(e) => updateField('timePeriod', e.target.value)}
        placeholder="e.g., Medieval, Modern, Future"
      />
    </div>
    <div style={styles.formGroup}>
      <label style={styles.label}>Technology Level</label>
      <input
        style={styles.input}
        value={data.technologyLevel || ''}
        onChange={(e) => updateField('technologyLevel', e.target.value)}
        placeholder="e.g., Stone Age, Industrial, Advanced"
      />
    </div>
    <div style={styles.formGroup}>
      <label style={styles.label}>History</label>
      <textarea
        style={styles.textarea}
        value={data.history || ''}
        onChange={(e) => updateField('history', e.target.value)}
        placeholder="Major historical events"
        rows="6"
      />
    </div>
    <div style={styles.formGroup}>
      <label style={styles.label}>Rules & Physics</label>
      <textarea
        style={styles.textarea}
        value={data.rulesPhysics || ''}
        onChange={(e) => updateField('rulesPhysics', e.target.value)}
        placeholder="How does your world work? Magic? Science? Special rules?"
        rows="6"
      />
    </div>
  </div>
);

export default WorldOverview;
