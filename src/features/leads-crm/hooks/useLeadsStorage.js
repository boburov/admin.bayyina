import { useState, useCallback } from "react";

const KEY = "bayyina_leads_crm_v1";

const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? []; }
  catch { return []; }
};

const write = (data) => {
  try { localStorage.setItem(KEY, JSON.stringify(data)); }
  catch {}
};

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useLeadsStorage = () => {
  const [leads, setLeads] = useState(read);

  const commit = useCallback((fn) => {
    setLeads((prev) => {
      const next = fn(prev);
      write(next);
      return next;
    });
  }, []);

  const addLead = useCallback((data) => {
    const lead = { id: uid(), ...data, createdAt: new Date().toISOString() };
    commit((p) => [lead, ...p]);
    return lead;
  }, [commit]);

  const editLead = useCallback((id, data) => {
    commit((p) => p.map((l) => (l.id === id ? { ...l, ...data } : l)));
  }, [commit]);

  const setStatus = useCallback((id, status) => {
    commit((p) =>
      p.map((l) =>
        l.id === id
          ? { ...l, status, ...(status === "student" ? { convertedAt: new Date().toISOString() } : {}) }
          : l
      )
    );
  }, [commit]);

  return { leads, addLead, editLead, setStatus };
};
