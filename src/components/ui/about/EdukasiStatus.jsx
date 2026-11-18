const levels = [
  ["Level I · Normal", "Aktivitas dasar gunung api belum menunjukkan perubahan signifikan."],
  ["Level II · Waspada", "Ada peningkatan aktivitas di atas kondisi normal; ikuti rekomendasi resmi."],
  ["Level III · Siaga", "Aktivitas meningkat dan potensi bahaya dapat mengancam kawasan tertentu."],
  ["Level IV · Awas", "Aktivitas tertinggi; patuhi larangan dan arahan evakuasi otoritas."],
];

function EdukasiStatus() {
  return (
    <section className="status-education" aria-labelledby="status-education-title">
      <span className="eyebrow">LITERASI KESELAMATAN</span>
      <h2 id="status-education-title">Memahami tingkat aktivitas gunung api.</h2>
      <div className="status-education-grid">
        {levels.map(([label, description], index) => (
          <article className={`status-education-card level-${index + 1}`} key={label}>
            <strong>{label}</strong><p>{description}</p>
          </article>
        ))}
      </div>
      <p className="status-education-note">Status dan rekomendasi dapat berubah. Selalu periksa MAGMA Indonesia atau otoritas setempat.</p>
    </section>
  );
}

export default EdukasiStatus;