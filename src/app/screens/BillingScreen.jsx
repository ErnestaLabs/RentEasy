export default function BillingScreen({ boosts, components, openOffer, purchases, wallet }) {
  const { BillingPanel } = components;
  return <BillingPanel onSelectProduct={openOffer} purchases={purchases} boosts={boosts} wallet={wallet} />;
}
