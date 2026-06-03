"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  User,
  Building2,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useUploadThing } from "@/lib/uploadthing";
import { api } from "@/lib/api/client";
import { toast } from "sonner";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/hooks/use-session";
import {
  useUpdateProfile,
  useUpdateOrganization,
} from "@/lib/hooks/use-settings";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  phone: z.string().max(20).optional(),
});

const organizationSchema = z.object({
  legalName: z.string().min(1, "Legal name is required").max(255),
  tradeName: z.string().max(255).optional(),
  subcity: z.string().max(100).optional(),
  cityRegion: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  tin: z.string().max(50).optional(),
  vatNumber: z.string().max(50).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email("Invalid email").optional(),
  isWithholdingAgent: z.boolean().default(false),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type OrganizationFormData = z.infer<typeof organizationSchema>;

const LOGO_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;

export default function SettingsPage() {
  const { data: session, isLoading: sessionLoading } = useSession();
  const queryClient = useQueryClient();
  const updateProfile = useUpdateProfile();
  const updateOrganization = useUpdateOrganization();
  const [activeTab, setActiveTab] = useState("profile");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [removingLogo, setRemovingLogo] = useState(false);

  const { startUpload, isUploading } = useUploadThing("logoUploader");
  const currentLogo = session?.organization?.logoAttachment;
  const isUploadingLogo = uploadingLogo || isUploading;

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: session?.user?.firstName || "",
      lastName: session?.user?.lastName || "",
      phone: session?.user?.phone || "",
    },
  });

  const organizationForm = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    values: {
      legalName: session?.organization?.legalName || "",
      tradeName: session?.organization?.tradeName || "",
      subcity: session?.organization?.subcity || "",
      cityRegion: session?.organization?.cityRegion || "",
      country: session?.organization?.country || "ET",
      tin: session?.organization?.tin || "",
      vatNumber: session?.organization?.vatNumber || "",
      phone: session?.organization?.phone || "",
      email: session?.organization?.email || "",
      isWithholdingAgent: session?.organization?.isWithholdingAgent || false,
    },
  });

  const canEditOrganization = () => {
    if (!session?.membership) return false;
    const role = session.membership.role;
    return ["Owner", "Admin"].includes(role);
  };

  const handleProfileSubmit = (data: ProfileFormData) => {
    updateProfile.mutate(data);
  };

  const handleOrganizationSubmit = (data: OrganizationFormData) => {
    updateOrganization.mutate(data);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!LOGO_MIME_TYPES.has(file.type)) {
        toast.error("Unsupported file type", {
          description: "Logo must be a PNG, JPG, or WebP image",
        });
        e.target.value = "";
        return;
      }

      if (file.size > MAX_LOGO_SIZE_BYTES) {
        toast.error("File too large", {
          description: "Logo must be under 2MB",
        });
        e.target.value = "";
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;

    setUploadingLogo(true);
    try {
      const result = await startUpload([logoFile], {
        intent: "organizationLogo",
      });
      const upload = result?.[0];

      if (!upload?.serverData?.attachmentId) {
        throw new Error("Upload finished but the server did not confirm it");
      }

      await queryClient.invalidateQueries({ queryKey: ["session"] });

      toast.success("Logo uploaded successfully");
      setLogoFile(null);
      setLogoPreview(null);
    } catch (error) {
      toast.error("Failed to upload logo", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    setRemovingLogo(true);
    try {
      await api.delete("/api/organization/logo");
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      toast.success("Logo removed successfully");
    } catch (error) {
      toast.error("Failed to remove logo", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setRemovingLogo(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-brand-yellow-500 mx-auto" />
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">
          Manage your profile and organization settings
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="bg-white/5 border-white/10">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-brand-yellow-500 data-[state=active]:text-black"
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          {canEditOrganization() && (
            <TabsTrigger
              value="organization"
              className="data-[state=active]:bg-brand-yellow-500 data-[state=active]:text-black"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Organization
            </TabsTrigger>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Personal Information</CardTitle>
              <CardDescription className="text-gray-400">
                Update your personal details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={session?.user?.email || ""}
                    disabled
                    className="bg-white/5 border-white/10 text-gray-400"
                  />
                  <p className="text-xs text-gray-500">
                    Email cannot be changed
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-300">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      {...profileForm.register("firstName")}
                      className="bg-white/5 border-white/10 text-white"
                    />
                    {profileForm.formState.errors.firstName && (
                      <p className="text-sm text-red-400">
                        {profileForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-300">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      {...profileForm.register("lastName")}
                      className="bg-white/5 border-white/10 text-white"
                    />
                    {profileForm.formState.errors.lastName && (
                      <p className="text-sm text-red-400">
                        {profileForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-300">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    {...profileForm.register("phone")}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="+251900000000"
                  />
                  {profileForm.formState.errors.phone && (
                    <p className="text-sm text-red-400">
                      {profileForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={updateProfile.isPending}
                    className="bg-brand-yellow-500 text-black hover:bg-brand-yellow-600 font-semibold"
                  >
                    {updateProfile.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Tab */}
        {canEditOrganization() && (
          <TabsContent value="organization" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="gap-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white">
                      {logoPreview ? (
                        <Image
                          src={logoPreview}
                          alt="Logo Preview"
                          width={112}
                          height={64}
                          className="object-contain"
                        />
                      ) : currentLogo ? (
                        <Image
                          src={currentLogo.url}
                          alt="Organization Logo"
                          width={112}
                          height={64}
                          className="object-contain"
                        />
                      ) : (
                        <ImageIcon className="h-7 w-7 text-gray-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-white">
                        Organization Details
                      </CardTitle>
                      <CardDescription className="mt-1 text-gray-400">
                        {logoPreview
                          ? `Preview: ${logoFile?.name || "selected logo"} (${Math.round(
                              (logoFile?.size || 0) / 1024
                            )}KB)`
                          : currentLogo
                            ? `Logo ready for invoices and bills • ${Math.round(
                                currentLogo.size / 1024
                              )}KB`
                            : "Update your organization information and logo"}
                      </CardDescription>
                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG, or WebP • Max 2MB • Recommended 400×200px
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleLogoChange}
                      className="hidden"
                    />

                    {logoPreview ? (
                      <>
                        <Button
                          type="button"
                          onClick={handleLogoUpload}
                          disabled={isUploadingLogo}
                          size="sm"
                          className="bg-brand-yellow-500 text-black hover:bg-brand-yellow-600"
                        >
                          {isUploadingLogo ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setLogoFile(null);
                            setLogoPreview(null);
                          }}
                          variant="outline"
                          size="sm"
                          className="border-white/20 text-white hover:bg-white/5"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-white/20 text-white hover:bg-white/5"
                          onClick={() =>
                            document.getElementById("logo-upload")?.click()
                          }
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {currentLogo ? "Change Logo" : "Add Logo"}
                        </Button>
                        {currentLogo && (
                          <Button
                            type="button"
                            onClick={handleRemoveLogo}
                            disabled={removingLogo}
                            variant="outline"
                            size="sm"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            {removingLogo ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <X className="mr-2 h-4 w-4" />
                                Remove
                              </>
                            )}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={organizationForm.handleSubmit(
                    handleOrganizationSubmit
                  )}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="orgCode" className="text-gray-300">
                      Organization Code
                    </Label>
                    <Input
                      id="orgCode"
                      value={session?.organization?.code || ""}
                      disabled
                      className="bg-white/5 border-white/10 text-gray-400"
                    />
                    <p className="text-xs text-gray-500">
                      Organization code cannot be changed
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="legalName" className="text-gray-300">
                        Legal Name *
                      </Label>
                      <Input
                        id="legalName"
                        {...organizationForm.register("legalName")}
                        className="bg-white/5 border-white/10 text-white"
                      />
                      {organizationForm.formState.errors.legalName && (
                        <p className="text-sm text-red-400">
                          {organizationForm.formState.errors.legalName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tradeName" className="text-gray-300">
                        Trade Name
                      </Label>
                      <Input
                        id="tradeName"
                        {...organizationForm.register("tradeName")}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subcity" className="text-gray-300">
                        Subcity
                      </Label>
                      <Input
                        id="subcity"
                        {...organizationForm.register("subcity")}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cityRegion" className="text-gray-300">
                        City/Region
                      </Label>
                      <Input
                        id="cityRegion"
                        {...organizationForm.register("cityRegion")}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-gray-300">
                        Country
                      </Label>
                      <Input
                        id="country"
                        {...organizationForm.register("country")}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="ET"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tin" className="text-gray-300">
                        TIN
                      </Label>
                      <Input
                        id="tin"
                        {...organizationForm.register("tin")}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="10 digits"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vatNumber" className="text-gray-300">
                        VAT Number
                      </Label>
                      <Input
                        id="vatNumber"
                        {...organizationForm.register("vatNumber")}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="orgPhone" className="text-gray-300">
                        Phone
                      </Label>
                      <Input
                        id="orgPhone"
                        {...organizationForm.register("phone")}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="+251900000000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orgEmail" className="text-gray-300">
                        Email
                      </Label>
                      <Input
                        id="orgEmail"
                        type="email"
                        {...organizationForm.register("email")}
                        className="bg-white/5 border-white/10 text-white"
                      />
                      {organizationForm.formState.errors.email && (
                        <p className="text-sm text-red-400">
                          {organizationForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                    <Checkbox
                      id="isWithholdingAgent"
                      checked={organizationForm.watch("isWithholdingAgent")}
                      onCheckedChange={(checked) =>
                        organizationForm.setValue(
                          "isWithholdingAgent",
                          checked === true,
                          { shouldDirty: true }
                        )
                      }
                      className="mt-1 border-white/20 data-[state=checked]:bg-brand-yellow-500 data-[state=checked]:text-black"
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="isWithholdingAgent"
                        className="text-gray-200 font-medium cursor-pointer"
                      >
                        Organization is a withholding company
                      </Label>
                      <p className="text-sm text-gray-400">
                        Purchase bills will default WHT on. Users can turn it
                        off per bill only with a reason.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      disabled={updateOrganization.isPending}
                      className="bg-brand-yellow-500 text-black hover:bg-brand-yellow-600 font-semibold"
                    >
                      {updateOrganization.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
