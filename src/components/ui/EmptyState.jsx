function EmptyState({ title = "Belum ada hasil", description, actionLabel, onAction }) {
  return (
    <section className="catalog-empty" aria-live="polite">
      <span aria-hidden="true">⌕</span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {actionLabel && onAction && <button className="button button-lime" type="button" onClick={onAction}>{actionLabel}</button>}
    </section>
  );
}

export default EmptyState;