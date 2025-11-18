/**
 * Customer Detail Page
 *
 * Displays detailed customer information with tabs for Overview, Properties, Notes, and Activities
 */

import {
  Activity,
  ArrowLeft,
  Clock,
  Edit2,
  FileText,
  Mail,
  MapPin,
  Network,
  Paperclip,
  Phone,
  Plus,
  Repeat,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";

import { AppleButton, AppleCard, AppleModal } from "@/components/crm/apple-ui";
import { AuditTimeline } from "@/components/crm/AuditTimeline";
import CRMLayout from "@/components/crm/CRMLayout";
import { DocumentList } from "@/components/crm/DocumentList";
import { ErrorDisplay } from "@/components/crm/ErrorDisplay";
import { LoadingSpinner } from "@/components/crm/LoadingSpinner";
import { RelationshipGraph } from "@/components/crm/RelationshipGraph";
import { SubscriptionList } from "@/components/crm/SubscriptionList";
import { PanelErrorBoundary } from "@/components/PanelErrorBoundary";
import { usePageTitle } from "@/hooks/usePageTitle";
import { trpc } from "@/lib/trpc";
import { sanitizeText } from "@/utils/sanitize";

type Tab =
  | "overview"
  | "properties"
  | "notes"
  | "documents"
  | "relationships"
  | "subscriptions"
  | "audit"
  | "activities";

export default function CustomerDetail() {
  const [, params] = useRoute<{ id: string }>("/crm/customers/:id");
  const [, navigate] = useLocation();
  const customerId = params?.id ? parseInt(params.id, 10) : null;
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [editingProperty, setEditingProperty] = useState<number | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [propertyData, setPropertyData] = useState({
    address: "",
    city: "",
    postalCode: "",
    isPrimary: false,
    notes: "",
  });

  const utils = trpc.useUtils();

  const {
    data: customer,
    isLoading,
    error,
    isError,
  } = trpc.crm.customer.getProfile.useQuery(
    { id: customerId! },
    { enabled: !!customerId }
  );

  const { data: properties } = trpc.crm.customer.listProperties.useQuery(
    { customerProfileId: customerId! },
    { enabled: !!customerId && activeTab === "properties" }
  );

  const { data: notes } = trpc.crm.customer.listNotes.useQuery(
    { customerProfileId: customerId! },
    { enabled: !!customerId && activeTab === "notes" }
  );

  const { data: activities } = trpc.crm.activity.listActivities.useQuery(
    { customerProfileId: customerId!, limit: 50 },
    { enabled: !!customerId && activeTab === "activities" }
  );

  const addNoteMutation = trpc.crm.customer.addNote.useMutation({
    onSuccess: () => {
      utils.crm.customer.listNotes.invalidate({
        customerProfileId: customerId!,
      });
      toast.success("Note added successfully");
      setShowNoteModal(false);
      setNoteContent("");
    },
    onError: error => {
      toast.error(error.message || "Failed to add note");
    },
  });

  const updateNoteMutation = trpc.crm.customer.updateNote.useMutation({
    onSuccess: () => {
      utils.crm.customer.listNotes.invalidate({
        customerProfileId: customerId!,
      });
      toast.success("Note updated successfully");
      setShowNoteModal(false);
      setEditingNote(null);
      setNoteContent("");
    },
    onError: error => {
      toast.error(error.message || "Failed to update note");
    },
  });

  const deleteNoteMutation = trpc.crm.customer.deleteNote.useMutation({
    onSuccess: () => {
      utils.crm.customer.listNotes.invalidate({
        customerProfileId: customerId!,
      });
      toast.success("Note deleted successfully");
    },
    onError: error => {
      toast.error(error.message || "Failed to delete note");
    },
  });

  const createPropertyMutation = trpc.crm.customer.createProperty.useMutation({
    onSuccess: () => {
      utils.crm.customer.listProperties.invalidate({
        customerProfileId: customerId!,
      });
      toast.success("Property added successfully");
      setShowPropertyModal(false);
      setPropertyData({
        address: "",
        city: "",
        postalCode: "",
        isPrimary: false,
        notes: "",
      });
    },
    onError: error => {
      toast.error(error.message || "Failed to add property");
    },
  });

  const updatePropertyMutation = trpc.crm.customer.updateProperty.useMutation({
    onSuccess: () => {
      utils.crm.customer.listProperties.invalidate({
        customerProfileId: customerId!,
      });
      toast.success("Property updated successfully");
      setShowPropertyModal(false);
      setEditingProperty(null);
      setPropertyData({
        address: "",
        city: "",
        postalCode: "",
        isPrimary: false,
        notes: "",
      });
    },
    onError: error => {
      toast.error(error.message || "Failed to update property");
    },
  });

  const deletePropertyMutation = trpc.crm.customer.deleteProperty.useMutation({
    onSuccess: () => {
      utils.crm.customer.listProperties.invalidate({
        customerProfileId: customerId!,
      });
      toast.success("Property deleted successfully");
    },
    onError: error => {
      toast.error(error.message || "Failed to delete property");
    },
  });

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) {
      toast.error("Note content is required");
      return;
    }
    await addNoteMutation.mutateAsync({
      customerProfileId: customerId!,
      content: noteContent,
    });
  };

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || !editingNote) {
      toast.error("Note content is required");
      return;
    }
    await updateNoteMutation.mutateAsync({
      id: editingNote,
      content: noteContent,
    });
  };

  const handleDeleteNote = async (noteId: number) => {
    if (confirm("Are you sure you want to delete this note?")) {
      await deleteNoteMutation.mutateAsync({ id: noteId });
    }
  };

  const handleEditNote = (noteId: number, content: string) => {
    setEditingNote(noteId);
    setNoteContent(content);
    setShowNoteModal(true);
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyData.address.trim()) {
      toast.error("Address is required");
      return;
    }
    await createPropertyMutation.mutateAsync({
      customerProfileId: customerId!,
      address: propertyData.address,
      city: propertyData.city || undefined,
      postalCode: propertyData.postalCode || undefined,
      isPrimary: propertyData.isPrimary,
      notes: propertyData.notes || undefined,
    });
  };

  const handleUpdateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyData.address.trim() || !editingProperty) {
      toast.error("Address is required");
      return;
    }
    await updatePropertyMutation.mutateAsync({
      id: editingProperty,
      address: propertyData.address,
      city: propertyData.city || undefined,
      postalCode: propertyData.postalCode || undefined,
      isPrimary: propertyData.isPrimary,
      notes: propertyData.notes || undefined,
    });
  };

  const handleDeleteProperty = async (propertyId: number) => {
    if (confirm("Are you sure you want to delete this property?")) {
      await deletePropertyMutation.mutateAsync({ id: propertyId });
    }
  };

  const handleEditProperty = (propertyId: number) => {
    const property = properties?.find(p => p.id === propertyId);
    if (!property) return;
    setEditingProperty(property.id);
    setPropertyData({
      address: property.address,
      city: property.city || "",
      postalCode: property.postalCode || "",
      isPrimary: property.isPrimary,
      notes: property.notes || "",
    });
    setShowPropertyModal(true);
  };

  usePageTitle(customer ? `${customer.name} - Customer` : "Customer Details");

  if (!customerId) {
    return (
      <CRMLayout>
        <ErrorDisplay message="Invalid customer ID" />
      </CRMLayout>
    );
  }

  return (
    <CRMLayout>
      <PanelErrorBoundary name="Customer Detail">
        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Back Button */}
            <AppleButton
              variant="tertiary"
              onClick={() => navigate("/crm/customers")}
              className="mb-4"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Customers
            </AppleButton>

            {/* Loading State */}
            {isLoading ? (
              <LoadingSpinner message="Loading customer..." />
            ) : isError ? (
              <ErrorDisplay message="Failed to load customer" error={error} />
            ) : customer ? (
              <>
                {/* Header */}
                <header>
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold">{sanitizeText(customer.name)}</h1>
                      <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                        {customer.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{customer.email}</span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary capitalize">
                        {customer.status}
                      </span>
                    </div>
                  </div>
                </header>

                {/* Tabs */}
                <div className="border-b border-border">
                  <nav className="flex gap-4" role="tablist">
                    {[
                      { id: "overview", label: "Overview", icon: FileText },
                      { id: "properties", label: "Properties", icon: MapPin },
                      { id: "notes", label: "Notes", icon: FileText },
                      { id: "documents", label: "Documents", icon: Paperclip },
                      {
                        id: "relationships",
                        label: "Relationships",
                        icon: Network,
                      },
                      {
                        id: "subscriptions",
                        label: "Subscriptions",
                        icon: Repeat,
                      },
                      { id: "audit", label: "Audit", icon: Clock },
                      { id: "activities", label: "Activities", icon: Activity },
                    ].map(tab => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          role="tab"
                          aria-selected={activeTab === tab.id}
                          aria-controls={`tabpanel-${tab.id}`}
                          onClick={() => setActiveTab(tab.id as Tab)}
                          className={`px-4 py-2 border-b-2 transition-colors ${
                            activeTab === tab.id
                              ? "border-primary text-primary"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Tab Content */}
                <div role="tabpanel" id={`tabpanel-${activeTab}`}>
                  {activeTab === "overview" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <AppleCard variant="elevated">
                        <div className="p-6">
                          <h2 className="text-xl font-semibold mb-4">
                            Customer Information
                          </h2>
                          <dl className="space-y-3">
                            <div>
                              <dt className="text-sm text-muted-foreground">
                                Name
                              </dt>
                              <dd className="text-base font-medium">
                                {sanitizeText(customer.name)}
                              </dd>
                            </div>
                            {customer.email && (
                              <div>
                                <dt className="text-sm text-muted-foreground">
                                  Email
                                </dt>
                                <dd className="text-base">{customer.email}</dd>
                              </div>
                            )}
                            {customer.phone && (
                              <div>
                                <dt className="text-sm text-muted-foreground">
                                  Phone
                                </dt>
                                <dd className="text-base">{customer.phone}</dd>
                              </div>
                            )}
                            <div>
                              <dt className="text-sm text-muted-foreground">
                                Status
                              </dt>
                              <dd className="text-base capitalize">
                                {customer.status}
                              </dd>
                            </div>
                            {customer.customerType && (
                              <div>
                                <dt className="text-sm text-muted-foreground">
                                  Type
                                </dt>
                                <dd className="text-base capitalize">
                                  {customer.customerType}
                                </dd>
                              </div>
                            )}
                          </dl>
                        </div>
                      </AppleCard>

                      <AppleCard variant="elevated">
                        <div className="p-6">
                          <h2 className="text-xl font-semibold mb-4">
                            Financial Summary
                          </h2>
                          <dl className="space-y-3">
                            <div>
                              <dt className="text-sm text-muted-foreground">
                                Total Invoiced
                              </dt>
                              <dd className="text-base font-medium">
                                {new Intl.NumberFormat("da-DK", {
                                  style: "currency",
                                  currency: "DKK",
                                }).format(customer.totalInvoiced || 0)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm text-muted-foreground">
                                Total Paid
                              </dt>
                              <dd className="text-base font-medium">
                                {new Intl.NumberFormat("da-DK", {
                                  style: "currency",
                                  currency: "DKK",
                                }).format(customer.totalPaid || 0)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm text-muted-foreground">
                                Balance
                              </dt>
                              <dd className="text-base font-medium">
                                {new Intl.NumberFormat("da-DK", {
                                  style: "currency",
                                  currency: "DKK",
                                }).format(customer.balance || 0)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-sm text-muted-foreground">
                                Invoice Count
                              </dt>
                              <dd className="text-base">
                                {customer.invoiceCount || 0}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </AppleCard>

                      {customer.createdAt && (
                        <AppleCard variant="elevated">
                          <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">
                              Timeline
                            </h2>
                            <dl className="space-y-3">
                              <div>
                                <dt className="text-sm text-muted-foreground">
                                  Created
                                </dt>
                                <dd className="text-base">
                                  {new Date(
                                    customer.createdAt
                                  ).toLocaleDateString("da-DK", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </dd>
                              </div>
                              {customer.updatedAt && (
                                <div>
                                  <dt className="text-sm text-muted-foreground">
                                    Last Updated
                                  </dt>
                                  <dd className="text-base">
                                    {new Date(
                                      customer.updatedAt
                                    ).toLocaleDateString("da-DK", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </dd>
                                </div>
                              )}
                            </dl>
                          </div>
                        </AppleCard>
                      )}
                    </div>
                  )}

                  {activeTab === "properties" && (
                    <div className="space-y-4">
                      <div className="flex justify-end">
                        <AppleButton
                          onClick={() => {
                            setEditingProperty(null);
                            setPropertyData({
                              address: "",
                              city: "",
                              postalCode: "",
                              isPrimary: false,
                              notes: "",
                            });
                            setShowPropertyModal(true);
                          }}
                          leftIcon={<Plus className="w-4 h-4" />}
                        >
                          Add Property
                        </AppleButton>
                      </div>
                      {properties && properties.length > 0 ? (
                        properties.map(property => (
                          <AppleCard key={property.id} variant="elevated">
                            <div className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg">
                                    {property.address}
                                  </h3>
                                  {(property.city || property.postalCode) && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {[property.postalCode, property.city]
                                        .filter(Boolean)
                                        .join(" ")}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {property.isPrimary && (
                                    <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                                      Primary
                                    </span>
                                  )}
                                  <AppleButton
                                    variant="tertiary"
                                    size="sm"
                                    onClick={() =>
                                      handleEditProperty(property.id)
                                    }
                                    leftIcon={<Edit2 className="w-3 h-3" />}
                                  >
                                    Edit
                                  </AppleButton>
                                  <AppleButton
                                    variant="tertiary"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteProperty(property.id)
                                    }
                                    leftIcon={<Trash2 className="w-3 h-3" />}
                                  >
                                    Delete
                                  </AppleButton>
                                </div>
                              </div>
                              {property.notes && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  {property.notes}
                                </p>
                              )}
                            </div>
                          </AppleCard>
                        ))
                      ) : (
                        <AppleCard variant="elevated">
                          <div className="p-12 text-center">
                            <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                              No properties
                            </h3>
                            <p className="text-muted-foreground mb-4">
                              This customer has no properties yet.
                            </p>
                            <AppleButton
                              onClick={() => {
                                setEditingProperty(null);
                                setPropertyData({
                                  address: "",
                                  city: "",
                                  postalCode: "",
                                  isPrimary: false,
                                  notes: "",
                                });
                                setShowPropertyModal(true);
                              }}
                              leftIcon={<Plus className="w-4 h-4" />}
                            >
                              Add First Property
                            </AppleButton>
                          </div>
                        </AppleCard>
                      )}
                    </div>
                  )}

                  {activeTab === "notes" && (
                    <div className="space-y-4">
                      <div className="flex justify-end">
                        <AppleButton
                          onClick={() => {
                            setEditingNote(null);
                            setNoteContent("");
                            setShowNoteModal(true);
                          }}
                          leftIcon={<Plus className="w-4 h-4" />}
                        >
                          Add Note
                        </AppleButton>
                      </div>
                      {notes && notes.length > 0 ? (
                        notes.map(note => (
                          <AppleCard key={note.id} variant="elevated">
                            <div className="p-6">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold">Note</h3>
                                <div className="flex items-center gap-2">
                                  {note.createdAt && (
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(
                                        note.createdAt
                                      ).toLocaleDateString("da-DK", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  )}
                                  <AppleButton
                                    variant="tertiary"
                                    size="sm"
                                    onClick={() =>
                                      handleEditNote(note.id, note.note || "")
                                    }
                                    leftIcon={<Edit2 className="w-3 h-3" />}
                                  >
                                    Edit
                                  </AppleButton>
                                  <AppleButton
                                    variant="tertiary"
                                    size="sm"
                                    onClick={() => handleDeleteNote(note.id)}
                                    leftIcon={<Trash2 className="w-3 h-3" />}
                                  >
                                    Delete
                                  </AppleButton>
                                </div>
                              </div>
                              {note.note && (
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">
                                  {sanitizeText(note.note)}
                                </p>
                              )}
                            </div>
                          </AppleCard>
                        ))
                      ) : (
                        <AppleCard variant="elevated">
                          <div className="p-12 text-center">
                            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                              No notes
                            </h3>
                            <p className="text-muted-foreground mb-4">
                              No notes have been added to this customer yet.
                            </p>
                            <AppleButton
                              onClick={() => {
                                setEditingNote(null);
                                setNoteContent("");
                                setShowNoteModal(true);
                              }}
                              leftIcon={<Plus className="w-4 h-4" />}
                            >
                              Add First Note
                            </AppleButton>
                          </div>
                        </AppleCard>
                      )}
                    </div>
                  )}

                  {activeTab === "documents" && (
                    <div className="space-y-4">
                      <DocumentList customerProfileId={customerId!} />
                    </div>
                  )}

                  {activeTab === "relationships" && (
                    <div className="space-y-4">
                      <RelationshipGraph customerProfileId={customerId!} />
                    </div>
                  )}

                  {activeTab === "audit" && (
                    <div className="space-y-4">
                      <AuditTimeline
                        entityType="customer"
                        entityId={customerId!}
                      />
                    </div>
                  )}

                  {activeTab === "subscriptions" && (
                    <div className="space-y-4">
                      <SubscriptionList customerProfileId={customerId!} />
                    </div>
                  )}

                  {activeTab === "activities" && (
                    <div className="space-y-4">
                      {activities && activities.length > 0 ? (
                        activities.map(activity => (
                          <AppleCard key={activity.id} variant="elevated">
                            <div className="p-6">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <Activity className="w-5 h-5 text-primary" />
                                  <div>
                                    <h3 className="font-semibold">
                                      {activity.subject}
                                    </h3>
                                    <p className="text-xs text-muted-foreground capitalize">
                                      {activity.activityType.replace("_", " ")}
                                    </p>
                                  </div>
                                </div>
                                {activity.createdAt && (
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(
                                      activity.createdAt
                                    ).toLocaleDateString("da-DK", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                )}
                              </div>
                              {activity.description && (
                                <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                                  {activity.description}
                                </p>
                              )}
                              {activity.outcome && (
                                <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                                  <strong>Outcome:</strong> {activity.outcome}
                                </div>
                              )}
                            </div>
                          </AppleCard>
                        ))
                      ) : (
                        <AppleCard variant="elevated">
                          <div className="p-12 text-center">
                            <Activity className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                              No activities
                            </h3>
                            <p className="text-muted-foreground">
                              No activities have been logged for this customer
                              yet.
                            </p>
                          </div>
                        </AppleCard>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : null}

            {/* Add/Edit Note Modal */}
            <AppleModal
              isOpen={showNoteModal}
              onClose={() => {
                setShowNoteModal(false);
                setEditingNote(null);
                setNoteContent("");
              }}
              title={editingNote ? "Edit Note" : "Add Note"}
              size="md"
            >
              <form
                onSubmit={editingNote ? handleUpdateNote : handleAddNote}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="note-content"
                    className="block text-sm font-medium mb-2"
                  >
                    Note Content *
                  </label>
                  <textarea
                    id="note-content"
                    required
                    value={noteContent}
                    onChange={e => setNoteContent(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    rows={6}
                    placeholder="Enter note content..."
                  />
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <AppleButton
                    type="button"
                    variant="tertiary"
                    onClick={() => {
                      setShowNoteModal(false);
                      setEditingNote(null);
                      setNoteContent("");
                    }}
                  >
                    Cancel
                  </AppleButton>
                  <AppleButton
                    type="submit"
                    loading={
                      editingNote
                        ? updateNoteMutation.isPending
                        : addNoteMutation.isPending
                    }
                    disabled={!noteContent.trim()}
                  >
                    {editingNote ? "Update Note" : "Add Note"}
                  </AppleButton>
                </div>
              </form>
            </AppleModal>

            {/* Add/Edit Property Modal */}
            <AppleModal
              isOpen={showPropertyModal}
              onClose={() => {
                setShowPropertyModal(false);
                setEditingProperty(null);
                setPropertyData({
                  address: "",
                  city: "",
                  postalCode: "",
                  isPrimary: false,
                  notes: "",
                });
              }}
              title={editingProperty ? "Edit Property" : "Add Property"}
              size="md"
            >
              <form
                onSubmit={
                  editingProperty ? handleUpdateProperty : handleAddProperty
                }
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="property-address"
                    className="block text-sm font-medium mb-2"
                  >
                    Address *
                  </label>
                  <input
                    id="property-address"
                    type="text"
                    required
                    value={propertyData.address}
                    onChange={e =>
                      setPropertyData({
                        ...propertyData,
                        address: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    placeholder="Street address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="property-postal"
                      className="block text-sm font-medium mb-2"
                    >
                      Postal Code
                    </label>
                    <input
                      id="property-postal"
                      type="text"
                      value={propertyData.postalCode}
                      onChange={e =>
                        setPropertyData({
                          ...propertyData,
                          postalCode: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                      placeholder="1234"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="property-city"
                      className="block text-sm font-medium mb-2"
                    >
                      City
                    </label>
                    <input
                      id="property-city"
                      type="text"
                      value={propertyData.city}
                      onChange={e =>
                        setPropertyData({
                          ...propertyData,
                          city: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                      placeholder="Copenhagen"
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={propertyData.isPrimary}
                      onChange={e =>
                        setPropertyData({
                          ...propertyData,
                          isPrimary: e.target.checked,
                        })
                      }
                      className="rounded border-border"
                    />
                    <span className="text-sm font-medium">
                      Primary property
                    </span>
                  </label>
                </div>
                <div>
                  <label
                    htmlFor="property-notes"
                    className="block text-sm font-medium mb-2"
                  >
                    Notes
                  </label>
                  <textarea
                    id="property-notes"
                    value={propertyData.notes}
                    onChange={e =>
                      setPropertyData({
                        ...propertyData,
                        notes: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    rows={3}
                    placeholder="Additional notes about this property..."
                  />
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <AppleButton
                    type="button"
                    variant="tertiary"
                    onClick={() => {
                      setShowPropertyModal(false);
                      setEditingProperty(null);
                      setPropertyData({
                        address: "",
                        city: "",
                        postalCode: "",
                        isPrimary: false,
                        notes: "",
                      });
                    }}
                  >
                    Cancel
                  </AppleButton>
                  <AppleButton
                    type="submit"
                    loading={
                      editingProperty
                        ? updatePropertyMutation.isPending
                        : createPropertyMutation.isPending
                    }
                    disabled={!propertyData.address.trim()}
                  >
                    {editingProperty ? "Update Property" : "Add Property"}
                  </AppleButton>
                </div>
              </form>
            </AppleModal>
          </div>
        </main>
      </PanelErrorBoundary>
    </CRMLayout>
  );
}
