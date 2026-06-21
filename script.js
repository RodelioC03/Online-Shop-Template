async function placeOrder(event) {
  event.preventDefault();

  if (cart.length === 0) {
    alert("Please add a dress to your cart first.");
    return;
  }

  const customerName = document.getElementById("customerName").value.trim();
  const customerEmail = document.getElementById("customerEmail").value.trim();
  const customerPhone = document.getElementById("customerPhone").value.trim();
  const customerAddress = document.getElementById("customerAddress").value.trim();
  const paymentMethod = document.getElementById("paymentMethod").value;
  const paymentReference = document.getElementById("paymentReference").value.trim();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderNumber = "RN-" + Date.now();

  try {
    await addDoc(collection(db, "orders"), {
      orderNumber: orderNumber,
      customerName: customerName,
      customerEmail: customerEmail,
      customerPhone: customerPhone,
      customerAddress: customerAddress,
      paymentMethod: paymentMethod,
      paymentReference: paymentReference,
      items: cart,
      total: total,
      status: "Pending Verification",
      paid: false,
      createdAt: serverTimestamp()
    });

    alert("Order placed successfully! Your order number is " + orderNumber);

    cart = [];
    renderCart();
    event.target.reset();

  } catch (error) {
    alert("Order failed. Please check your Firebase rules.");
    console.error(error);
  }
}
