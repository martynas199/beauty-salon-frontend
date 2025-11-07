import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { selectAdmin } from "../../features/auth/authSlice";
import { api } from "../../lib/apiClient";
import ServiceForm from "../ServiceForm";
import ServicesList from "../ServicesList";

export default function Services() {
  const [services, setServices] = useState([]);
  const [beauticians, setBeauticians] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get admin info from Redux store
  const admin = useSelector(selectAdmin);

  // Memoize role checks for performance
  const isSuperAdmin = useMemo(
    () => admin?.role === "super_admin",
    [admin?.role]
  );
  const isBeautician = useMemo(
    () => admin?.role === "admin" && admin?.beauticianId,
    [admin?.role, admin?.beauticianId]
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch services - backend will automatically filter based on admin role
      const [servicesRes, beauticiansRes] = await Promise.all([
        api.get("/services"),
        api.get("/beauticians"),
      ]);

      const loadedServices = servicesRes.data;
      setServices(loadedServices);
      setBeauticians(beauticiansRes.data);

      // Log for debugging
      console.log("[Services] Loaded services:", loadedServices.length);
      if (isBeautician) {
        console.log(
          "[Services] Beautician role - showing assigned services only"
        );
      } else if (isSuperAdmin) {
        console.log("[Services] Super admin role - showing all services");
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load services: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingService(null);
    setShowForm(true);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleSave = async (serviceData) => {
    try {
      // Separate image file from service data
      const imageFile = serviceData.image?.file;
      const serviceDataToSend = { ...serviceData };

      // Ensure IDs are strings (convert ObjectId to string if needed)
      if (serviceDataToSend.primaryBeauticianId) {
        serviceDataToSend.primaryBeauticianId = String(
          serviceDataToSend.primaryBeauticianId
        );
      }
      if (serviceDataToSend.additionalBeauticianIds?.length) {
        serviceDataToSend.additionalBeauticianIds =
          serviceDataToSend.additionalBeauticianIds.map((id) => String(id));
      }

      // Remove the file object from service data (keep only metadata if editing)
      // Remove image if: null, local-preview, or has a file (will be uploaded separately)
      if (
        !serviceDataToSend.image ||
        serviceDataToSend.image?.provider === "local-preview" ||
        imageFile
      ) {
        delete serviceDataToSend.image;
      } else if (serviceDataToSend.image?.file) {
        // Also remove the file property if it somehow still exists
        delete serviceDataToSend.image.file;
      }

      // 1. Create or update the service
      const url = editingService
        ? `/services/${editingService._id}`
        : "/services";

      const method = editingService ? "patch" : "post";

      const response = await api[method](url, serviceDataToSend);

      if (!response.data) {
        throw new Error("Failed to save service");
      }

      const savedService = response.data;

      // 2. Upload image to Cloudinary if a new file was selected
      if (imageFile && imageFile instanceof File) {
        try {
          const formData = new FormData();
          formData.append("image", imageFile);

          await api.post(
            `/services/${savedService._id}/upload-image`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          // Service was saved, but image upload failed
          toast.error(
            "Service saved, but image upload failed: " + uploadError.message
          );
        }
      }

      await loadData();
      setShowForm(false);
      setEditingService(null);
      toast.success(
        editingService
          ? "Service updated successfully"
          : "Service created successfully"
      );
    } catch (error) {
      console.error("Save error:", error);
      throw error; // Let form handle error display
    }
  };

  const handleDelete = async (serviceId) => {
    try {
      await api.delete(`/services/${serviceId}`);
      await loadData();
      setShowForm(false);
      setEditingService(null);
      toast.success("Service deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete service: " + error.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingService(null);
  };

  if (showForm) {
    return (
      <ServiceForm
        service={editingService}
        beauticians={beauticians}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={
          editingService ? () => handleDelete(editingService._id) : undefined
        }
        isSuperAdmin={isSuperAdmin}
        admin={admin}
      />
    );
  }

  return (
    <div className="space-y-4">
      <ServicesList
        services={services}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        isLoading={isLoading}
        isSuperAdmin={isSuperAdmin}
        isBeautician={isBeautician}
      />
    </div>
  );
}
