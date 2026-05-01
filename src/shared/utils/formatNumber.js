export const formatNumber = (val) => {
  if (val == null || val === "") return "0";
  return Number(val)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

export const formatMoney = (val) => {
  if (val == null || val === "") return "0 so'm";
  return `${formatNumber(val)} so'm`;
};
