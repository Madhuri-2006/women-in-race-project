import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { logAction } from "../../services/adminService";

/**
 * Generic list + search + add/edit modal + delete for one Firestore collection.
 *
 * config = {
 *   title, singular,
 *   fields:  [{ name, label, type, required, options, full, placeholder }],
 *   columns: [{ key, label, render?(item, ctx) }],
 *   load(), add(data), update(id, data), remove(id),
 *   idKey,                       // field holding the Firestore doc id
 *   searchKeys: string[],
 *   emptyForm,                   // defaults for "Add"
 *   toForm?(item), fromForm?(form, items, isNew),
 *   label(item),                 // used in confirms + activity log
 * }
 */
function ResourceManager({ config, onChange }) {
  const { currentUser } = useAuth();
  const {
    title,
    singular,
    fields,
    columns,
    load,
    add,
    update,
    remove,
    idKey = "firestoreId",
    searchKeys = [],
    emptyForm,
    toForm = (item) => ({ ...emptyForm, ...item }),
    fromForm = (form) => form,
    label,
  } = config;

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // null | { id|null, form }
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");

  const refresh = useCallback(async () => {
    try {
      setItems(await load());
      setStatus("ready");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }, [load]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      searchKeys.some((k) => String(item[k] ?? "").toLowerCase().includes(q))
    );
  }, [items, search, searchKeys]);

  const openAdd = () => {
    setFormError("");
    setEditing({ id: null, form: { ...emptyForm } });
  };

  const openEdit = (item) => {
    setFormError("");
    setEditing({ id: item[idKey], form: toForm(item) });
  };

  const setField = (name, value) =>
    setEditing((e) => ({ ...e, form: { ...e.form, [name]: value } }));

  const save = async (e) => {
    e.preventDefault();
    const missing = fields.filter(
      (f) => f.required && String(editing.form[f.name] ?? "").trim() === ""
    );
    if (missing.length) {
      setFormError(`Required: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const isNew = editing.id == null;
      const data = fromForm(editing.form, items, isNew);
      if (isNew) await add(data);
      else await update(editing.id, data);
      await logAction(currentUser, `${isNew ? "Added" : "Updated"} ${singular}`, label(data));
      setToast(`${singular} ${isNew ? "added" : "updated"}`);
      setEditing(null);
      await refresh();
      onChange?.();
    } catch (err) {
      setFormError(err.code === "permission-denied" ? "Permission denied. Is your admin access set up in Firestore rules?" : err.message);
    } finally {
      setSaving(false);
    }
  };

  const destroy = async (item) => {
    if (!window.confirm(`Delete ${singular.toLowerCase()} "${label(item)}"? This cannot be undone.`)) return;
    try {
      await remove(item[idKey]);
      await logAction(currentUser, `Deleted ${singular}`, label(item));
      setToast(`${singular} deleted`);
      await refresh();
      onChange?.();
    } catch (err) {
      setToast(`Delete failed: ${err.code || err.message}`);
    }
  };

  // Inline quick-update used by custom column renderers (e.g. score +1).
  const quickUpdate = async (item, patch, logDetail) => {
    try {
      await update(item[idKey], patch);
      setItems((list) => list.map((x) => (x[idKey] === item[idKey] ? { ...x, ...patch } : x)));
      if (logDetail) await logAction(currentUser, `Updated ${singular}`, logDetail);
    } catch (err) {
      setToast(`Update failed: ${err.code || err.message}`);
    }
  };

  return (
    <section className="adm-section">
      <div className="adm-section-head">
        <div>
          <h2>{title}</h2>
          <p className="adm-muted">{items.length} total</p>
        </div>
        <div className="adm-actions">
          {searchKeys.length > 0 && (
            <input
              className="adm-search"
              type="search"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          )}
          <button type="button" className="adm-btn" onClick={openAdd}>
            + Add {singular.toLowerCase()}
          </button>
        </div>
      </div>

      {status === "loading" && <p className="adm-muted">Loading…</p>}
      {status === "error" && (
        <p className="adm-error">Couldn't load {title.toLowerCase()}. Check your Firebase config and rules.</p>
      )}

      {status === "ready" && (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
                <th className="adm-col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="adm-empty">
                    {search ? "No matches." : `No ${title.toLowerCase()} yet.`}
                  </td>
                </tr>
              )}
              {filtered.map((item) => (
                <tr key={item[idKey]}>
                  {columns.map((c) => (
                    <td key={c.key} data-label={c.label}>
                      {c.render ? c.render(item, { quickUpdate }) : String(item[c.key] ?? "—")}
                    </td>
                  ))}
                  <td className="adm-col-actions">
                    <button type="button" className="adm-btn small ghost" onClick={() => openEdit(item)}>
                      Edit
                    </button>
                    <button type="button" className="adm-btn small danger" onClick={() => destroy(item)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="adm-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setEditing(null)}>
          <form className="adm-modal" onSubmit={save}>
            <div className="adm-modal-head">
              <h3>{editing.id == null ? `Add ${singular.toLowerCase()}` : `Edit ${singular.toLowerCase()}`}</h3>
              <button type="button" className="adm-close" onClick={() => setEditing(null)} aria-label="Close">
                ×
              </button>
            </div>

            <div className="adm-form-grid">
              {fields.map((f) => (
                <label key={f.name} className={`adm-field ${f.full ? "full" : ""} ${f.type === "checkbox" ? "check" : ""}`}>
                  <span>
                    {f.label}
                    {f.required && <em>*</em>}
                  </span>
                  <FieldInput field={f} value={editing.form[f.name]} onChange={(v) => setField(f.name, v)} />
                  {f.hint && <small className="adm-muted">{f.hint}</small>}
                </label>
              ))}
            </div>

            {formError && <p className="adm-error">{formError}</p>}

            <div className="adm-modal-foot">
              <button type="button" className="adm-btn ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="submit" className="adm-btn" disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {toast && <div className="adm-toast">{toast}</div>}
    </section>
  );
}

function FieldInput({ field, value, onChange }) {
  const common = { value: value ?? "", placeholder: field.placeholder || "" };
  switch (field.type) {
    case "textarea":
      return <textarea rows={4} {...common} onChange={(e) => onChange(e.target.value)} />;
    case "select":
      return (
        <select {...common} onChange={(e) => onChange(e.target.value)}>
          {field.options.map((o) => {
            const opt = typeof o === "object" ? o : { value: o, label: o };
            return (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            );
          })}
        </select>
      );
    case "checkbox":
      return <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />;
    case "number":
      return <input type="number" min={0} {...common} onChange={(e) => onChange(e.target.value)} />;
    case "date":
      return <input type="date" {...common} onChange={(e) => onChange(e.target.value)} />;
    default:
      return (
        <>
          <input type="text" list={field.options ? `dl-${field.name}` : undefined} {...common} onChange={(e) => onChange(e.target.value)} />
          {field.options && (
            <datalist id={`dl-${field.name}`}>
              {field.options.map((o) => (
                <option key={o} value={o} />
              ))}
            </datalist>
          )}
        </>
      );
  }
}

export default ResourceManager;
