function NationalStatsGrid({ stats = [] }) {
  return (
    <div className="national-stats-grid">
      {stats.map((stat) => (
        <article className="national-stat-card" key={stat.label}>
          <strong>{stat.value}</strong>
          <span>{stat.label}</span>
        </article>
      ))}
    </div>
  );
}

export default NationalStatsGrid;