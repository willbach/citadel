export const formatAmount = (amount: number) => new Intl.NumberFormat('en-US').format(amount);

export const genRanHex = (size: number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
