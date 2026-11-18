import { useState } from "react";

const checklist = [
  "Rencanakan perjalanan dan periksa informasi resmi kawasan.",
  "Tetap berada di jalur yang ditetapkan dan ikuti arahan petugas.",
  "Bawa kembali sampah dan kurangi barang sekali pakai.",
  "Hormati satwa liar, tumbuhan, budaya, serta ruang hidup masyarakat lokal.",
];

function LeaveNoTraceList() {
  const [checked, setChecked] = useState([]);
  function toggleChecklist(index) {
    setChecked((current) => current.includes(index)
      ? current.filter((item) => item !== index)
      : [...current, index]);
  }

  return (
    <>
      <div className="ethics-list">
        {checklist.map((item, index) => (
          <label className={checked.includes(index) ? "ethics-item is-checked" : "ethics-item"} key={item}>
            <input type="checkbox" checked={checked.includes(index)} onChange={() => toggleChecklist(index)} />
            <span className="ethics-check" aria-hidden="true">{checked.includes(index) ? "✓" : ""}</span><span>{item}</span>
          </label>
        ))}
      </div>
      <div className="checklist-progress" aria-live="polite">
        <span><span style={{ width: `${checked.length / checklist.length * 100}%` }} /></span>
        <small>{checked.length} dari {checklist.length} siap dilakukan</small>
      </div>
    </>
  );
}

export default LeaveNoTraceList;