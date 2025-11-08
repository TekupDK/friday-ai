/**
 * Phase 9.9: Email Assistant Integration i EmailThreadView
 * 
 * Tilføj EmailAssistant3Panel efter AI Label Suggestions
 * Før EmailActions og reply box
 */

// I EmailThreadView.tsx - tilføj import og integration:

import { EmailAssistant3Panel } from "../workspace/EmailAssistant3Panel";

// I EmailThreadView component - tilføj efter linje 281 (efter EmailLabelSuggestions):

                {/* Phase 9.9: AI Email Assistant - below label suggestions */}
                {isLast && (
                  <EmailAssistant3Panel
                    emailData={{
                      from: message.from || "",
                      subject: message.subject || "",
                      body: (message as any).bodyText || message.body || "",
                      threadId: message.threadId || threadId,
                    }}
                    onInsertReply={(content) => {
                      // Insert content i reply box
                      if (onReply) {
                        onReply({
                          content,
                          threadId: message.threadId || threadId,
                          messageId: message.id,
                        });
                      }
                    }}
                    onSendEmail={async (content) => {
                      // Send email direkte
                      try {
                        await trpc.gmail.sendMessage.mutate({
                          threadId: message.threadId || threadId,
                          content,
                        });
                        toast.success("Email sendt!");
                      } catch (error) {
                        toast.error("Fejl ved afsendelse");
                      }
                    }}
                  />
                )}
