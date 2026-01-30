export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function whatsappQuoteLink(productName: string) {
  const text = `Hi, I would like a quote for ${productName}.`;
  return `https://wa.me/917666247666?text=${encodeURIComponent(text)}`;
}
