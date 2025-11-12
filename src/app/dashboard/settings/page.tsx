"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
});

type ProfileFormData = z.infer<typeof profileSchema>;
type OrganizationFormData = z.infer<typeof organizationSchema>;

export default function SettingsPage() {
  const { data: session, isLoading: sessionLoading } = useSession();
  const updateProfile = useUpdateProfile();
  const updateOrganization = useUpdateOrganization();
  const [activeTab, setActiveTab] = useState("profile");

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
              <CardHeader>
                <CardTitle className="text-white">
                  Organization Details
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Update your organization information
                </CardDescription>
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
