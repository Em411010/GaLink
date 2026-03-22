import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, FileText, DollarSign, Calendar, Tag, Loader2 } from "lucide-react";
import { contractAPI } from "../../services/api";
import toast from "react-hot-toast";

const SKILL_SUGGESTIONS = [
  // Trades & Home Services
  "Plumbing", "Electrical Wiring", "Carpentry", "Masonry", "Painting", "Welding",
  "Aircon Repair", "Appliance Repair", "Roofing", "Tiling", "Glass Installation",
  "Interior Design", "Landscaping", "Gardening", "Pest Control", "Cleaning Services",
  "Laundry", "Catering", "Cooking", "Baking",
  // Technology
  "Web Development", "Mobile App Development", "Frontend Development", "Backend Development",
  "Full Stack Development", "React", "Vue.js", "Angular", "Node.js", "Laravel",
  "WordPress", "Shopify", "Python", "Java", "PHP", "JavaScript", "TypeScript",
  "Database Design", "MySQL", "MongoDB", "API Development", "DevOps",
  "Cybersecurity", "Network Setup", "IT Support", "Computer Repair",
  // Design & Creative
  "Graphic Design", "Logo Design", "UI/UX Design", "Video Editing", "Photo Editing",
  "Photography", "Videography", "Animation", "Social Media Design", "Print Design",
  "Illustration", "3D Modeling",
  // Business & Marketing
  "Social Media Management", "SEO", "Content Writing", "Copywriting",
  "Data Entry", "Virtual Assistant", "Bookkeeping", "Accounting",
  "Digital Marketing", "Email Marketing", "Market Research",
  // Personal Services
  "Tutoring", "Driving", "Delivery", "Moving", "Security", "Event Planning",
  "Babysitting", "Elderly Care", "Pet Care", "Tailoring", "Hair Styling",
];

export default function ContractModal({ freelancer, prefill = {}, contractToEdit, onClose, onCreated, skipNavigate }) {
  const navigate = useNavigate();

  // If editing an existing contract, use it as the initial form state
  const initial = contractToEdit
    ? {
        title: contractToEdit.title || "",
        description: contractToEdit.description || "",
        skills: contractToEdit.skills || [],
        amount: contractToEdit.amount || "",
        rateType: contractToEdit.rateType || "fixed",
        startDate: contractToEdit.startDate
          ? new Date(contractToEdit.startDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        endDate: contractToEdit.endDate
          ? new Date(contractToEdit.endDate).toISOString().split("T")[0]
          : "",
      }
    : {
        title: prefill.title || "",
        description: prefill.description || "",
        skills: prefill.skills || freelancer?.skills?.slice(0, 5) || [],
        amount: prefill.estimatedBudget || "",
        rateType: "fixed",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
      };

  const [form, setForm] = useState(initial);
  const [skillInput, setSkillInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const skillInputRef = useRef(null);

  const filteredSuggestions = skillInput.trim().length > 0
    ? SKILL_SUGGESTIONS.filter(
        (s) => s.toLowerCase().includes(skillInput.toLowerCase()) && !form.skills.includes(s)
      ).slice(0, 8)
    : [];

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const addSkill = (value) => {
    const s = (value ?? skillInput).trim();
    if (s && !form.skills.includes(s)) {
      updateField("skills", [...form.skills, s]);
    }
    setSkillInput("");
    setShowSuggestions(false);
  };

  const removeSkill = (skill) => updateField("skills", form.skills.filter((s) => s !== skill));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");
    setSubmitting(true);
    try {
      const res = await contractAPI.createContract({
        freelancerId: freelancer._id,
        title: form.title.trim(),
        description: form.description.trim(),
        skills: form.skills,
        amount: Number(form.amount) || 0,
        rateType: form.rateType,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      });
      toast.success("Contract sent!");
      onCreated?.(res.data.contract);
      onClose();
      if (!skipNavigate) navigate(`/messages?userId=${freelancer._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create contract");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <dialog className="modal modal-open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <FileText size={18} className="text-primary" />
            {contractToEdit ? "Edit & Resend Contract" : "Create Contract"}
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={18} />
          </button>
        </div>
        <div className="flex items-center gap-3 p-3 bg-base-200/60 rounded-xl mb-5 border border-base-300">
          <div className="avatar">
            <div className="w-11 rounded-full">
              {freelancer?.profilePhoto ? (
                <img src={freelancer.profilePhoto} alt={freelancer.name} />
              ) : (
                <div className="bg-primary text-primary-content w-full h-full flex items-center justify-center font-bold rounded-full">
                  {freelancer?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <div>
            <p className="font-semibold text-sm">{freelancer?.name}</p>
            <p className="text-xs text-base-content/50">Freelancer</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label py-1"><span className="label-text text-sm font-medium mr-2">Title</span></label>
            <input
              type="text"
              className="input input-bordered"
              placeholder="e.g. Fix kitchen plumbing"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              maxLength={200}
            />
          </div>
          <div className="form-control">
            <label className="label py-1"><span className="label-text text-sm font-medium mr-2">Description</span></label>
            <textarea
              className="textarea textarea-bordered leading-snug"
              placeholder="Describe the work needed..."
              rows={3}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              maxLength={1000}
            />
          </div>
          <div className="form-control">
            <label className="label py-1"><span className="label-text text-sm font-medium">Skills / Tags</span></label>
            {form.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.skills.map((skill) => (
                  <span key={skill} className="badge badge-primary gap-1">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="hover:text-error">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="relative">
              <div className="flex gap-1">
                <input
                  ref={skillInputRef}
                  type="text"
                  className="input input-bordered flex-1"
                  placeholder="Add a skill..."
                  value={skillInput}
                  onChange={(e) => { setSkillInput(e.target.value); setShowSuggestions(true); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); addSkill(); }
                    if (e.key === "Escape") setShowSuggestions(false);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  autoComplete="off"
                />
                <button type="button" onClick={() => addSkill()} className="btn btn-ghost btn-square">
                  <Tag size={16} />
                </button>
              </div>
              {showSuggestions && filteredSuggestions.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full bg-base-100 border border-base-300 rounded-xl shadow-lg overflow-hidden">
                  {filteredSuggestions.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2 text-sm hover:bg-base-200 transition-colors flex items-center gap-2"
                        onMouseDown={(e) => { e.preventDefault(); addSkill(s); }}
                      >
                        <Tag size={11} className="text-primary shrink-0" />
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label py-1"><span className="label-text text-sm font-medium">Amount (₱)</span></label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input
                  type="number"
                  className="input input-bordered pl-8 w-full"
                  placeholder="0"
                  min={0}
                  value={form.amount}
                  onChange={(e) => updateField("amount", e.target.value)}
                />
              </div>
            </div>
            <div className="form-control">
              <label className="label py-1"><span className="label-text text-sm font-medium">Rate Type</span></label>
              <select
                className="select select-bordered"
                value={form.rateType}
                onChange={(e) => updateField("rateType", e.target.value)}
              >
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-sm font-medium flex items-center gap-1"><Calendar size={12} /> Start</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={form.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-sm font-medium flex items-center gap-1"><Calendar size={12} /> End</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={form.endDate}
                onChange={(e) => updateField("endDate", e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary gap-1">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              {contractToEdit ? "Resend Contract" : "Send Contract"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
