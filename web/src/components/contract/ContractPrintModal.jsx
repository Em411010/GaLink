import { useRef } from "react";
import { X, Printer } from "lucide-react";

export default function ContractPrintModal({ contract, onClose }) {
  const printRef = useRef(null);

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Contract — ${contract.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; font-size: 13px; color: #111; background: #fff; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .brand span { color: #7c3aed; }
    .doc-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #555; margin-top: 4px; }
    .status { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; border-radius: 4px; padding: 4px 10px; }
    .status.pending  { background: #fef3c7; color: #92400e; }
    .status.active   { background: #dbeafe; color: #1e40af; }
    .status.completed { background: #d1fae5; color: #065f46; }
    .status.cancelled { background: #f3f4f6; color: #374151; }
    .status.disputed  { background: #fee2e2; color: #991b1b; }
    h2 { font-size: 20px; font-weight: 700; margin-bottom: 6px; }
    h3 { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #555; margin-bottom: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
    .description { font-size: 13px; color: #444; line-height: 1.6; margin-bottom: 20px; }
    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .party-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; }
    .party-role { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin-bottom: 4px; }
    .party-name { font-size: 15px; font-weight: 700; }
    .section { margin-bottom: 20px; }
    .skills { display: flex; flex-wrap: wrap; gap: 6px; }
    .skill { background: #ede9fe; color: #5b21b6; font-size: 11px; font-weight: 500; padding: 3px 9px; border-radius: 20px; }
    .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
    .meta-item label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; display: block; margin-bottom: 2px; }
    .meta-item .value { font-size: 14px; font-weight: 600; color: #111; }
    .rating-box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; margin-bottom: 20px; }
    .rating-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
    .rating-row .label { color: #555; }
    .rating-row .val { font-weight: 600; }
    .comment { font-style: italic; color: #444; margin-top: 8px; font-size: 12px; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 48px; }
    .sig-line { border-top: 1px solid #aaa; padding-top: 8px; font-size: 11px; color: #666; }
    .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #aaa; border-top: 1px solid #e5e7eb; padding-top: 12px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
${content}
</body>
</html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  const fmt = (date) =>
    date ? new Date(date).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }) : "—";

  const avg = contract.rating
    ? ((contract.rating.workQuality + contract.rating.communication + contract.rating.reliability) / 3).toFixed(1)
    : null;

  return (
    <dialog className="modal modal-open z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-base-100 z-10 py-1">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Printer size={17} className="text-primary" /> Print / Save as PDF
          </h3>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="btn btn-primary btn-sm gap-1.5">
              <Printer size={14} /> Print / Save PDF
            </button>
            <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
              <X size={16} />
            </button>
          </div>
        </div>
        <div ref={printRef} className="bg-white text-black rounded-lg border border-base-300 p-6 text-sm leading-relaxed">
          <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #111", paddingBottom: "16px", marginBottom: "24px" }}>
            <div>
              <div className="brand" style={{ fontSize: "22px", fontWeight: "700" }}>
                Ga<span style={{ color: "#7c3aed" }}>Link</span>
              </div>
              <div className="doc-title" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "#555", marginTop: "4px" }}>
                Service Contract
              </div>
            </div>
            <span className={`status ${contract.status}`} style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              fontSize: "11px", fontWeight: "600", textTransform: "uppercase",
              borderRadius: "4px", padding: "4px 10px",
              background: { pending: "#fef3c7", active: "#dbeafe", completed: "#d1fae5", cancelled: "#f3f4f6", disputed: "#fee2e2" }[contract.status] || "#f3f4f6",
              color: { pending: "#92400e", active: "#1e40af", completed: "#065f46", cancelled: "#374151", disputed: "#991b1b" }[contract.status] || "#374151",
            }}>
              {contract.status?.toUpperCase()}
            </span>
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "6px" }}>{contract.title}</h2>
          {contract.description && (
            <p className="description" style={{ fontSize: "13px", color: "#444", lineHeight: "1.6", marginBottom: "20px" }}>
              {contract.description}
            </p>
          )}
          <div className="section">
            <h3 style={{ fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", color: "#555", marginBottom: "8px", borderBottom: "1px solid #e5e7eb", paddingBottom: "4px" }}>Parties</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "14px" }}>
                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#888", marginBottom: "4px" }}>Hirer</div>
                <div style={{ fontSize: "15px", fontWeight: "700" }}>{contract.hirer?.name || "—"}</div>
              </div>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "14px" }}>
                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#888", marginBottom: "4px" }}>Freelancer</div>
                <div style={{ fontSize: "15px", fontWeight: "700" }}>{contract.freelancer?.name || "—"}</div>
              </div>
            </div>
          </div>
          {contract.skills?.length > 0 && (
            <div className="section" style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", color: "#555", marginBottom: "8px", borderBottom: "1px solid #e5e7eb", paddingBottom: "4px" }}>Service / Skills</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {contract.skills.map((s, i) => (
                  <span key={i} style={{ background: "#ede9fe", color: "#5b21b6", fontSize: "11px", fontWeight: "500", padding: "3px 9px", borderRadius: "20px" }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="section" style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", color: "#555", marginBottom: "8px", borderBottom: "1px solid #e5e7eb", paddingBottom: "4px" }}>Terms</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
              {contract.amount > 0 && (
                <div>
                  <label style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#888", display: "block", marginBottom: "2px" }}>Amount</label>
                  <span style={{ fontSize: "14px", fontWeight: "600" }}>
                    ₱{contract.amount.toLocaleString()}{contract.rateType === "hourly" ? "/hr" : ""}
                  </span>
                </div>
              )}
              <div>
                <label style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#888", display: "block", marginBottom: "2px" }}>Created</label>
                <span style={{ fontSize: "14px", fontWeight: "600" }}>{fmt(contract.createdAt)}</span>
              </div>
              {contract.startDate && (
                <div>
                  <label style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#888", display: "block", marginBottom: "2px" }}>Start Date</label>
                  <span style={{ fontSize: "14px", fontWeight: "600" }}>{fmt(contract.startDate)}</span>
                </div>
              )}
              {contract.endDate && (
                <div>
                  <label style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#888", display: "block", marginBottom: "2px" }}>End Date</label>
                  <span style={{ fontSize: "14px", fontWeight: "600" }}>{fmt(contract.endDate)}</span>
                </div>
              )}
              {contract.completedAt && (
                <div>
                  <label style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px", color: "#888", display: "block", marginBottom: "2px" }}>Completed</label>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#065f46" }}>{fmt(contract.completedAt)}</span>
                </div>
              )}
            </div>
          </div>
          {contract.rating && (
            <div className="section" style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", color: "#555", marginBottom: "8px", borderBottom: "1px solid #e5e7eb", paddingBottom: "4px" }}>Performance Rating</h3>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "14px" }}>
                {[
                  ["Work Quality", contract.rating.workQuality],
                  ["Communication", contract.rating.communication],
                  ["Reliability", contract.rating.reliability],
                  ["Average", avg],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "13px", borderBottom: label === "Reliability" ? "1px solid #f3f4f6" : "none" }}>
                    <span style={{ color: "#555" }}>{label}</span>
                    <span style={{ fontWeight: "600" }}>{val} / {label === "Average" ? "5.0" : "5"}</span>
                  </div>
                ))}
                {contract.rating.comment && (
                  <p style={{ fontStyle: "italic", color: "#444", marginTop: "8px", fontSize: "12px" }}>
                    "{contract.rating.comment}"
                  </p>
                )}
              </div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", marginTop: "48px" }}>
            <div>
              <div style={{ borderTop: "1px solid #aaa", paddingTop: "8px", fontSize: "11px", color: "#666" }}>
                <strong>{contract.hirer?.name}</strong> — Hirer
              </div>
            </div>
            <div>
              <div style={{ borderTop: "1px solid #aaa", paddingTop: "8px", fontSize: "11px", color: "#666" }}>
                <strong>{contract.freelancer?.name}</strong> — Freelancer
              </div>
            </div>
          </div>
          <div style={{ marginTop: "40px", textAlign: "center", fontSize: "10px", color: "#aaa", borderTop: "1px solid #e5e7eb", paddingTop: "12px" }}>
            Generated by GaLink · {new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })} · Contract ID: {contract._id}
          </div>
        </div>
      </div>
    </dialog>
  );
}
