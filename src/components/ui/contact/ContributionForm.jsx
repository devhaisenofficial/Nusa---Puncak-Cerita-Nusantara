import { useState } from "react";


const initialForm = { name: "", email: "", topic: "Usulan data", message: "" };

function ContributionForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState(initialForm);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setSubmitted(false);
  }

  function submitForm(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <form className="contribution-form" onSubmit={submitForm}>
      <div className="form-row">
        <label>Nama<input autoComplete="name" name="name" value={form.name} onChange={updateField} placeholder="Nama Anda" required /></label>
        <label>Email<input autoComplete="email" name="email" type="email" value={form.email} onChange={updateField} placeholder="nama@email.com" required /></label>
      </div>
      <label>Jenis masukan<select name="topic" value={form.topic} onChange={updateField}>
        <option>Usulan data</option><option>Koreksi informasi</option><option>Ide kolaborasi</option><option>Pertanyaan umum</option>
      </select></label>
      <label>Pesan<textarea name="message" value={form.message} onChange={updateField} placeholder="Ceritakan masukan atau sumber yang ingin Anda bagikan..." rows="5" minLength="15" required /></label>
      <button className="button button-lime form-submit" type="submit">Kirim masukan <Icon name="arrow-up-right" /></button>
      {submitted && <p className="form-feedback" role="status">Terima kasih, {form.name}. Form ini masih berupa pratinjau dan belum mengirim data ke server.</p>}
      <p className="form-privacy">Jangan sertakan data pribadi sensitif. Form ini belum terhubung ke layanan pengiriman.</p>
    </form>
  );
}

export default ContributionForm;
import Icon from "../Icon.jsx";