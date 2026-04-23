"use client";
import { useState } from "react";
import { Plus, Trash2, IndianRupee } from "lucide-react";

type Props = {
  onCreated: () => void;
  onMessage: (msg: string) => void;
};

export default function ScholarshipCreateForm({ onCreated, onMessage }: Props) {
  const [name, setName] = useState("");
  const [providers, setProviders] = useState([""]);
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [amount, setAmount] = useState("");
  const [seats, setSeats] = useState("");
  const [deadline, setDeadline] = useState("");
  const [criteria, setCriteria] = useState([""]);
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const addProvider = () => setProviders((p) => [...p, ""]);
  const removeProvider = (i: number) => setProviders((p) => p.filter((_, idx) => idx !== i));
  const updateProvider = (i: number, v: string) => setProviders((p) => p.map((item, idx) => (idx === i ? v : item)));

  const addCriteria = () => setCriteria((c) => [...c, ""]);
  const removeCriteria = (i: number) => setCriteria((c) => c.filter((_, idx) => idx !== i));
  const updateCriteria = (i: number, v: string) => setCriteria((c) => c.map((item, idx) => (idx === i ? v : item)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const filteredProviders = providers.filter((p) => p.trim());
    const filteredCriteria = criteria.filter((c) => c.trim());
    if (filteredProviders.length === 0) { onMessage("At least one provider is required."); return; }
    if (filteredCriteria.length === 0) { onMessage("At least one eligibility criterion is required."); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/scholarships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scholarshipName: name, providerNames: filteredProviders, scholarshipYear: year,
          amountInr: Number(amount), seats: Number(seats), deadlineDate: deadline,
          eligibilityCriteria: filteredCriteria, description, contactEmail: email, contactPhone: phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) { onMessage(data.message || "Error creating scholarship."); return; }
      onMessage("Scholarship created successfully!");
      setName(""); setProviders([""]); setYear(String(new Date().getFullYear()));
      setAmount(""); setSeats(""); setDeadline(""); setCriteria([""]);
      setDescription(""); setEmail(""); setPhone("");
      onCreated();
    } catch { onMessage("Network error."); } finally { setSaving(false); }
  };

  const inputCls = "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary";

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-lg font-bold">Create New Scholarship</h3>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Scholarship Name" className={inputCls} required />
          <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" className={inputCls} required />
          <label className="relative">
            <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (INR)" className={`${inputCls} pl-10`} required />
          </label>
          <input type="number" min="1" value={seats} onChange={(e) => setSeats(e.target.value)} placeholder="Total Seats" className={inputCls} required />
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputCls} required />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Contact Email" className={inputCls} required />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Contact Phone" className={inputCls} required />
        </div>

        {/* Provider Names - dynamic */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Provider Names</p>
            <button type="button" onClick={addProvider} className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/5">
              <Plus className="h-3 w-3" /> Add Provider
            </button>
          </div>
          <div className="space-y-2">
            {providers.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{i + 1}</span>
                <input value={p} onChange={(e) => updateProvider(i, e.target.value)} placeholder={`Provider ${i + 1}`} className={`${inputCls} flex-1`} required />
                {providers.length > 1 && (
                  <button type="button" onClick={() => removeProvider(i)} className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Eligibility Criteria - dynamic points */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Eligibility Criteria (Points)</p>
            <button type="button" onClick={addCriteria} className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/5">
              <Plus className="h-3 w-3" /> Add Point
            </button>
          </div>
          <div className="space-y-2">
            {criteria.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-[10px] font-bold text-secondary">{i + 1}</span>
                <input value={c} onChange={(e) => updateCriteria(i, e.target.value)} placeholder={`Criterion ${i + 1}`} className={`${inputCls} flex-1`} required />
                {criteria.length > 1 && (
                  <button type="button" onClick={() => removeCriteria(i)} className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Scholarship Description" className={`${inputCls} min-h-20`} required />

        <button type="submit" disabled={saving} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60">
          {saving ? "Saving..." : "Create Scholarship"}
        </button>
      </form>
    </section>
  );
}
