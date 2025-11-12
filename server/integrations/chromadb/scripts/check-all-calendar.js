// Check ALL Calendar events (before linking) for recurring patterns
const fs = require("fs");

console.log("📅 Analyzing ALL Calendar events for recurring patterns...\n");

// We need to fetch Calendar events for longer period to see recurring
// Let's read complete-leads file which should have more history

try {
  const completeData = JSON.parse(
    fs.readFileSync(
      "server/integrations/chromadb/test-data/complete-leads-v4.3.3.json",
      "utf8"
    )
  );

  console.log("📊 Dataset Info:");
  console.log("   Total Leads: " + completeData.leads.length);
  console.log(
    "   With Calendar: " + completeData.leads.filter(l => l.calendar).length
  );
  console.log(
    "   Time Window: " +
      completeData.metadata.timeWindow.startDate +
      " to " +
      completeData.metadata.timeWindow.endDate
  );

  // Group by customer
  const byCustomer = {};
  completeData.leads.forEach(lead => {
    if (lead.calendar) {
      const key = lead.customerEmail || lead.customerName;
      if (!byCustomer[key]) {
        byCustomer[key] = {
          name: lead.customerName,
          email: lead.customerEmail,
          bookings: [],
        };
      }
      byCustomer[key].bookings.push({
        date: lead.calendar.startTime,
        service:
          lead.calendar.serviceType || lead.calculated?.property?.serviceType,
        price: lead.calendar.price,
      });
    }
  });

  // Find recurring (2+ bookings)
  const recurring = Object.values(byCustomer)
    .filter(c => c.bookings.length >= 2)
    .sort((a, b) => b.bookings.length - a.bookings.length);

  console.log("\n🔄 RECURRING CUSTOMERS (" + recurring.length + " found):");
  console.log("═".repeat(70));

  recurring.slice(0, 10).forEach(customer => {
    console.log("\n👤 " + customer.name);
    console.log("   📧 " + (customer.email || "N/A"));
    console.log("   📅 " + customer.bookings.length + " bookings");

    const dates = customer.bookings
      .map(b => new Date(b.date))
      .sort((a, b) => a - b);
    customer.bookings
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .forEach((b, i) => {
        const dateStr = new Date(b.date).toLocaleDateString("da-DK");
        const price = b.price ? b.price + " kr" : "N/A";
        console.log(
          "      " +
            (i + 1) +
            ". " +
            dateStr +
            " - " +
            (b.service || "N/A") +
            " (" +
            price +
            ")"
        );
      });

    // Calculate frequency
    if (dates.length >= 2) {
      const daysBetween = [];
      for (let i = 1; i < dates.length; i++) {
        const days = Math.round(
          (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24)
        );
        daysBetween.push(days);
      }
      const avgDays = Math.round(
        daysBetween.reduce((a, b) => a + b, 0) / daysBetween.length
      );
      const frequency =
        avgDays <= 9
          ? "🟢 Ugentlig"
          : avgDays <= 16
            ? "🟡 Hver 2. uge"
            : avgDays <= 23
              ? "🟠 Hver 3. uge"
              : avgDays <= 31
                ? "🔵 Månedlig"
                : "⚪ Uregelmæssig";
      console.log(
        "   ⏱️  Frekvens: " +
          frequency +
          " (~" +
          avgDays +
          " dage mellem bookings)"
      );

      // Calculate monthly revenue
      const totalRevenue = customer.bookings.reduce(
        (sum, b) => sum + (b.price || 0),
        0
      );
      const monthlyRevenue = totalRevenue / customer.bookings.length;
      console.log("   💰 Gns. booking: " + Math.round(monthlyRevenue) + " kr");
    }
  });

  // Summary
  console.log("\n📊 RECURRING CUSTOMER SUMMARY:");
  console.log("═".repeat(70));
  const totalRecurring = recurring.length;
  const totalBookings = recurring.reduce(
    (sum, c) => sum + c.bookings.length,
    0
  );
  const weekly = recurring.filter(c => {
    const dates = c.bookings.map(b => new Date(b.date)).sort((a, b) => a - b);
    if (dates.length < 2) return false;
    const avg =
      dates
        .slice(1)
        .reduce(
          (sum, d, i) => sum + (d - dates[i]) / (1000 * 60 * 60 * 24),
          0
        ) /
      (dates.length - 1);
    return avg <= 9;
  }).length;
  const biweekly = recurring.filter(c => {
    const dates = c.bookings.map(b => new Date(b.date)).sort((a, b) => a - b);
    if (dates.length < 2) return false;
    const avg =
      dates
        .slice(1)
        .reduce(
          (sum, d, i) => sum + (d - dates[i]) / (1000 * 60 * 60 * 24),
          0
        ) /
      (dates.length - 1);
    return avg > 9 && avg <= 16;
  }).length;
  const monthly = recurring.filter(c => {
    const dates = c.bookings.map(b => new Date(b.date)).sort((a, b) => a - b);
    if (dates.length < 2) return false;
    const avg =
      dates
        .slice(1)
        .reduce(
          (sum, d, i) => sum + (d - dates[i]) / (1000 * 60 * 60 * 24),
          0
        ) /
      (dates.length - 1);
    return avg > 16 && avg <= 31;
  }).length;

  console.log("   Total recurring customers: " + totalRecurring);
  console.log("   Total bookings: " + totalBookings);
  console.log("   🟢 Ugentlig: " + weekly);
  console.log("   🟡 Hver 2. uge: " + biweekly);
  console.log("   🔵 Månedlig: " + monthly);
  console.log("   ⚪ Andre: " + (totalRecurring - weekly - biweekly - monthly));
} catch (err) {
  console.error("Error:", err.message);
  console.log("\nℹ️  Run collection script first to generate data file");
}
