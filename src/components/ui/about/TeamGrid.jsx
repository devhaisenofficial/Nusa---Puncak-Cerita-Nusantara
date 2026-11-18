function TeamGrid({ members = [] }) {
  if (!members.length) return null;
  return (
    <section className="team-grid-section" aria-labelledby="team-grid-title">
      <span className="eyebrow">KOLABORATOR</span>
      <h2 id="team-grid-title">Dibangun melalui kerja bersama.</h2>
      <div className="team-grid">
        {members.map((member) => (
          <article className="team-card" key={member.name}>
            <span className="team-avatar" aria-hidden="true">{member.name.slice(0, 1).toUpperCase()}</span>
            <h3>{member.name}</h3><p>{member.role}</p>
            {member.description && <small>{member.description}</small>}
          </article>
        ))}
      </div>
    </section>
  );
}

export default TeamGrid;