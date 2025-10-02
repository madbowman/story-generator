import React from 'react';
import styles from './styles';

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
      if (detailOnlyOnSelect) setViewMode('detail');
    }, 50);
  };

  const handleRemove = (index) => {
    onRemove(index);
    if (selected === index) {
      setSelected(-1);
      if (detailOnlyOnSelect) setViewMode('list');
    } else if (selected > index) setSelected(selected - 1);
  };

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
                    <div style={styles.listItemSubtitle}>{(it.type || it.role || it.description || '').slice(0, 60)}</div>
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
            {(detailOnlyOnSelect || enableDetailView) && viewMode === 'detail' && (
              <div style={{ marginBottom: '12px' }}>
                <button style={styles.backButton} onClick={() => { setViewMode('list'); setSelected(-1); }}>← Back</button>
              </div>
            )}
            {renderItemEditor(items[selected], selected, (field, value) => onUpdate(selected, field, value))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListDetail;
