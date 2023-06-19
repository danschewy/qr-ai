import React, { useEffect } from "react";

function StripePricing() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/pricing-table.js"; // replace this with the URL of your script
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
        <stripe-pricing-table pricing-table-id="prctbl_1NKp2NIWX5ShxFMRqGzb8xlX"
        publishable-key="pk_live_51K8HeXIWX5ShxFMRu32RQghPJAKj5ON2poMds93cuZIXobWJARLobCWR68J3vRUtFgbgJwodhZDZuneX0uIIMAZW00kcWRVU1D">
        </stripe-pricing-table>        
        `,
      }}
    />
  );
}

export default StripePricing;
