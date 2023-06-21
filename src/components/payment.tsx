import { useSession } from "next-auth/react";
import React, { useEffect } from "react";

function StripePricing() {
  const { data: sessionData, status } = useSession({ required: true });
  const email = sessionData?.user?.email;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/pricing-table.js"; // replace this with the URL of your script
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (status === "loading") return "Loading...";
  if (!email) return null;

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
        <stripe-pricing-table 
          pricing-table-id="prctbl_1NKp2NIWX5ShxFMRqGzb8xlX"
          publishable-key="pk_live_51K8HeXIWX5ShxFMRu32RQghPJAKj5ON2poMds93cuZIXobWJARLobCWR68J3vRUtFgbgJwodhZDZuneX0uIIMAZW00kcWRVU1D"
          customer-email="${email}">
        </stripe-pricing-table>        
        `,
      }}
    />
  );
}

export default StripePricing;
