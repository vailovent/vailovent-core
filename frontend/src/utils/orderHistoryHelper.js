const STORAGE_KEY = "vailovent_customer_orders";

/**
 * Mendapatkan seluruh riwayat pesanan pelanggan dari localStorage
 */
export const getCustomerOrders = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      : [];
  } catch (err) {
    console.error("Failed to read customer orders from localStorage:", err);
    return [];
  }
};

/**
 * Menyimpan atau memperbarui transaksi ke riwayat pesanan lokal
 */
export const saveCustomerOrder = (orderData) => {
  if (!orderData) return;
  const transactionId = orderData.transaction_id || orderData._id;
  if (!transactionId) return;

  try {
    const existing = getCustomerOrders();
    const cleanOrderId = orderData.order_id || (transactionId.startsWith("VAILOVENT-") ? transactionId : `VAILOVENT-${transactionId}`);

    const newEntry = {
      transaction_id: transactionId.replace("VAILOVENT-", ""),
      order_id: cleanOrderId,
      table_code: orderData.table_code || "-",
      customer_name: orderData.customer_name || "Pelanggan",
      customer_email: orderData.customer_email || "",
      total_amount: orderData.total_amount || 0,
      createdAt: orderData.createdAt || new Date().toISOString(),
      status: orderData.status || "pending",
      cooking_status: orderData.cooking_status || "Not Started",
    };

    // Replace if exists, or prepend
    const index = existing.findIndex((o) => o.transaction_id === newEntry.transaction_id || o.order_id === newEntry.order_id);
    if (index !== -1) {
      existing[index] = { ...existing[index], ...newEntry };
    } else {
      existing.unshift(newEntry);
    }

    // Keep max 20 latest orders
    const trimmed = existing.slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error("Failed to save customer order to localStorage:", err);
  }
};

/**
 * Mengambil pesanan aktif terbaru yang belum selesai dimasak
 */
export const getActiveCustomerOrder = () => {
  const orders = getCustomerOrders();
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

  return (
    orders.find((order) => {
      const orderTime = new Date(order.createdAt).getTime();
      const isRecent = orderTime > oneDayAgo;
      const isCookingIncomplete = order.cooking_status !== "Completed";
      const isNotExpired =
        order.status !== "expired" &&
        order.status !== "cancelled" &&
        order.status !== "failed";
      return isRecent && isCookingIncomplete && isNotExpired;
    }) || null
  );
};

/**
 * Menghitung jumlah pesanan aktif yang sedang diproses (belum Selesai / Completed)
 */
export const getActiveCustomerOrdersCount = () => {
  const orders = getCustomerOrders();
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

  return orders.filter((order) => {
    const orderTime = new Date(order.createdAt).getTime();
    const isRecent = orderTime > oneDayAgo;
    const isCookingIncomplete = order.cooking_status !== "Completed";
    const isNotExpired =
      order.status !== "expired" &&
      order.status !== "cancelled" &&
      order.status !== "failed";
    return isRecent && isCookingIncomplete && isNotExpired;
  }).length;
};
