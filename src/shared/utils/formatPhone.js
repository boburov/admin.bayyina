/**
 * Tel raqamni formatlash
 * @param {string} phone - Xom tel raqam
 * @returns {string} Formatlangan tel raqam
 */
export const formatPhone = (phone) => {
  if (!phone) return "";
  const d = String(phone).replace(/\D/g, "");
  if (d.length === 12)
    return `+${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5, 8)}-${d.slice(8, 10)}-${d.slice(10, 12)}`;
  return String(phone);
};
