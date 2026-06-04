export default function BillingScreen({ boosts, components, openUpsell, purchases, wallet }) {
  const { BillingPanel } = components;
  return <BillingPanel onSelectProduct={openUpsell} purchases={purchases} boosts={boosts} wallet={wallet} />;
}
