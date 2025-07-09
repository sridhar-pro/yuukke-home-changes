export async function getProductDetails(slug) {
  const id = slug.split("-").pop() || "";

  const token = localStorage.getItem("authToken");
  if (!token) {
    console.error("No auth token found in localStorage");
    return null;
  }

  try {
    const res = await fetch("/api/quantityCheck", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ slug, id }),
      cache: "no-store",
    });

    console.log("📦 Response Status:", res.status);
    console.log("📋 Response Headers:", [...res.headers.entries()]);

    const json = await res.json();
    console.log("🧾 Response Body:", json);

    if (!res.ok) {
      console.error("❌ API responded with an error", json);
      return null;
    }

    return json?.data?.[0] || null;
  } catch (e) {
    console.error("🔥 Error fetching product metadata:", e);
    return null;
  }
}
