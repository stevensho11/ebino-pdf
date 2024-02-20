import BillingForm from "@/Components/BillingForm";
import { getUserSubscriptionPlan } from "@/lib/stripe";

const page = async () => {
  const subscriptionPlan = await getUserSubscriptionPlan();

  return <BillingForm subscriptionPlan={subscriptionPlan} />;
};

export default page;
