import { getDb } from "./server/db";
import { conversations, messages } from "./drizzle/schema";
import { desc, eq, sql } from "drizzle-orm";

async function checkConversationTitles() {
  const db = await getDb();
  
  // Get recent conversations with message count
  const recentConversations = await db
    .select({
      id: conversations.id,
      title: conversations.title,
      createdAt: conversations.createdAt,
      updatedAt: conversations.updatedAt,
    })
    .from(conversations)
    .orderBy(desc(conversations.updatedAt))
    .limit(20);

  console.log("\n=== Conversation Titles Analysis ===\n");
  console.log(`Total conversations checked: ${recentConversations.length}\n`);

  let withEmoji = 0;
  let withoutEmoji = 0;
  let newConversation = 0;
  let nullTitle = 0;

  for (const conv of recentConversations) {
    // Count messages for this conversation
    const messageCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(eq(messages.conversationId, conv.id));
    
    const hasEmoji = /[\p{Emoji}]/u.test(conv.title || "");
    const isNewConversation = conv.title === "New Conversation" || !conv.title;
    
    if (isNewConversation) {
      newConversation++;
    } else if (hasEmoji) {
      withEmoji++;
    } else {
      withoutEmoji++;
    }
    
    if (!conv.title) {
      nullTitle++;
    }
    
    console.log(`ID ${conv.id}:`);
    console.log(`  Title: "${conv.title || "NULL"}"`);
    console.log(`  Messages: ${messageCount[0]?.count || 0}`);
    console.log(`  Has Emoji: ${hasEmoji ? "✅" : "❌"}`);
    console.log(`  Created: ${new Date(conv.createdAt).toLocaleString("da-DK")}`);
    console.log(`  Updated: ${new Date(conv.updatedAt).toLocaleString("da-DK")}`);
    console.log("");
  }

  console.log("\n=== Summary ===");
  console.log(`Conversations with emoji: ${withEmoji}`);
  console.log(`Conversations without emoji: ${withoutEmoji}`);
  console.log(`"New Conversation" or NULL: ${newConversation}`);
  console.log(`NULL titles: ${nullTitle}`);

  process.exit(0);
}

checkConversationTitles().catch(console.error);
