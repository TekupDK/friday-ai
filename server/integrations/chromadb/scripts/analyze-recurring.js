const fs = require('fs');
const data = JSON.parse(fs.readFileSync('server/integrations/chromadb/test-data/raw-leads-v4_3_3.json', 'utf8'));

// Group Calendar events by customer
const calendarByCustomer = {};
data.leads.forEach(lead => {
  if (lead.calendar && lead.customerEmail) {
    const email = lead.customerEmail.toLowerCase();
    if (!calendarByCustomer[email]) {
      calendarByCustomer[email] = [];
    }
    calendarByCustomer[email].push({
      name: lead.customerName,
      date: lead.calendar.startTime,
      service: lead.calendar.serviceType
    });
  }
});

// Find recurring customers (2+ bookings)
const recurring = Object.entries(calendarByCustomer)
  .filter(([email, bookings]) => bookings.length >= 2)
  .sort((a, b) => b[1].length - a[1].length);

console.log('🔄 RECURRING CUSTOMERS (2+ bookings):');
console.log('═'.repeat(60));
recurring.forEach(([email, bookings]) => {
  console.log('\n👤 ' + bookings[0].name);
  console.log('   📧 ' + email);
  console.log('   📅 ' + bookings.length + ' bookings');
  bookings.forEach((b, i) => {
    console.log('      ' + (i+1) + '. ' + new Date(b.date).toLocaleDateString('da-DK') + ' - ' + (b.service || 'N/A'));
  });
  
  // Calculate frequency if 2+ bookings
  if (bookings.length >= 2) {
    const dates = bookings.map(b => new Date(b.date)).sort((a,b) => a-b);
    const daysBetween = [];
    for (let i = 1; i < dates.length; i++) {
      const days = Math.round((dates[i] - dates[i-1]) / (1000*60*60*24));
      daysBetween.push(days);
    }
    const avgDays = Math.round(daysBetween.reduce((a,b) => a+b, 0) / daysBetween.length);
    const frequency = avgDays <= 9 ? 'Ugentlig' : 
                     avgDays <= 16 ? 'Hver 2. uge' :
                     avgDays <= 23 ? 'Hver 3. uge' :
                     avgDays <= 31 ? 'Månedlig' : 'Uregelmæssig';
    console.log('   ⏱️  Frekvens: ' + frequency + ' (~' + avgDays + ' dage)');
  }
});

console.log('\n📊 SUMMARY:');
console.log('   Total recurring customers: ' + recurring.length);
console.log('   Total bookings: ' + recurring.reduce((sum, [_, bookings]) => sum + bookings.length, 0));
