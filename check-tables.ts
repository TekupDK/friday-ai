import "dotenv/config";
import postgres from "postgres";

const dbUrl = new URL(process.env.DATABASE_URL!);
const schema = dbUrl.searchParams.get("schema") || "public";
dbUrl.searchParams.delete("schema");

const client = postgres(dbUrl.toString(), { ssl: false });

async function checkTables() {
  try {
    // Set search path
    await client`SET search_path TO ${client(schema)}`;

    const tablesToCheck = [
      "customer_profiles",
      "customer_properties",
      "service_templates",
      "bookings",
    ];

    for (const tbl of tablesToCheck) {
      const result = await client`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = ${schema}
          AND table_name = ${tbl}
      `;

      if (result.length > 0) {
        console.log(`✅ Table ${tbl} exists in schema ${schema}`);
      } else {
        console.log(`❌ Table ${tbl} NOT found in schema ${schema}`);
      }
    }

    // If any are missing, list all tables for debugging
    const missing = [];
    for (const tbl of tablesToCheck) {
      const check = await client`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = ${schema}
          AND table_name = ${tbl}
      `;
      if (check.length === 0) missing.push(tbl);
    }

    if (missing.length) {
      const allTables = await client`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = ${schema}
        ORDER BY table_name
      `;

      console.log(`\nTables in ${schema}:`);
      allTables.forEach(t => console.log(`  - ${t.table_name}`));
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.end();
  }
}

checkTables();
