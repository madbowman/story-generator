import React from 'react';
import styles from '../../styles/components/styles';

const ListDetail = (props) => {
  const {
    items = [],
    itemLabel = (it, i) => `Item ${i + 1}`,
    onAdd = () => {},
    onRemove = () => {},
    onUpdate = () => {},
    renderItemEditor = () => null,
    addLabel = '+ Add',
    emptyMessage = 'No items yet.',
    detailOnlyOnSelect = false,
    enableDetailView = true,
    title = '',
    previewFields = null,
    openDetailOnAdd = false,
    onViewModeChange = null,
  } = props;

  const [selected, setSelected] = React.useState(items && items.length ? 0 : -1);
  const [viewMode, setViewMode] = React.useState(detailOnlyOnSelect ? 'list' : 'split');

  React.useEffect(() => {
    if (!items || items.length === 0) {
      setSelected(-1);
    } else if (selected === -1 && items.length > 0) {
      setSelected(0);
    } else if (selected >= items.length) {
      setSelected(items.length - 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const handleAdd = () => {
    onAdd();
    setTimeout(() => {
      const newIndex = (items || []).length;
      setSelected(newIndex);
      if (openDetailOnAdd || detailOnlyOnSelect) setViewMode('detail');
    }, 50);
  };

  const handleRemove = (index) => {
    onRemove(index);
    if (selected === index) {
      setSelected(-1);
      if (detailOnlyOnSelect) setViewMode('list');
    } else if (selected > index) setSelected(selected - 1);
  };

  React.useEffect(() => {
    if (typeof onViewModeChange === 'function') onViewModeChange(viewMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  return (
    <div style={styles.listDetail}>
      {viewMode !== 'detail' && (
        <div style={styles.listPane}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>{title}</h2>
            <button style={styles.addButton} onClick={handleAdd}>{addLabel}</button>
          </div>

          {(!items || items.length === 0) ? (
            <div style={styles.emptyState}><p>{emptyMessage}</p></div>
          ) : (
            <div style={styles.itemList}>
              {items.map((it, idx) => (
                <div key={it.id || idx} style={{...styles.listItem, ...(selected === idx ? styles.listItemActive : {})}}>
                  <div style={styles.listItemMain} onClick={() => { setSelected(idx); if (detailOnlyOnSelect) setViewMode('detail'); }}>
                    <div style={styles.listItemTitle}>{itemLabel(it, idx)}</div>
                  </div>
                  <div style={styles.listItemActions}>
                    <button style={styles.smallButton} onClick={() => { setSelected(idx); if (detailOnlyOnSelect || enableDetailView) setViewMode('detail'); }}>View</button>
                    <button style={styles.removeButton} onClick={() => handleRemove(idx)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={viewMode === 'detail' && (detailOnlyOnSelect || enableDetailView) ? styles.detailFullPane : styles.detailPane}>
        {selected === -1 ? (
          <div style={styles.emptyState}><p>Select an item to view or edit.</p></div>
        ) : (
          <div>
            {viewMode === 'detail' ? (
              <div>
                {(detailOnlyOnSelect || enableDetailView) && (
                  <div style={{ marginBottom: '12px' }}>
                    <button style={styles.backButton} onClick={() => { setViewMode('list'); setSelected(-1); }}>← Back</button>
                  </div>
                )}
                {renderItemEditor(items[selected], selected, (field, value) => onUpdate(selected, field, value))}
              </div>
            ) : (
              // Split mode: concise preview rendered using the same detail styles but limited fields
              (previewFields && Array.isArray(previewFields) && previewFields.length) ? (
                <div style={styles.card}>
                  <div style={styles.cardHeader}><h3 style={styles.cardTitle}>{itemLabel(items[selected], selected)}</h3></div>
                  <div style={{ padding: '8px 12px' }}>
                    {previewFields.map((f) => {
                      const val = f.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : null, items[selected]);
                      const humanize = (s) => {
                        if (!s) return s;
                        // replace dots/underscores with spaces
                        let t = s.replace(/\./g, ' ').replace(/_/g, ' ');
                        // insert space between camelCase boundaries
                        t = t.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
                        t = t.replace(/\s+/g, ' ').trim();
                        // capitalize each word
                        return t.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                      };
                      const label = humanize(f);
                      return (
                        <div key={f} style={styles.formGroup}>
                          <label style={styles.label}>{label}</label>
                          <div style={styles.input}>{val === null || val === undefined ? '' : (typeof val === 'string' ? val : JSON.stringify(val))}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>{itemLabel(items[selected], selected)}</div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListDetail;
