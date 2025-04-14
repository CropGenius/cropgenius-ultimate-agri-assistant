
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AddFieldForm from "@/components/fields/AddFieldForm";
import { Field } from "@/types/field";
import { toast } from "sonner";

const ManageFields = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [farms, setFarms] = useState<any[]>([]);

  useEffect(() => {
    loadFields();
    loadFarms();
    console.log("✅ [ManageFieldsPage] loaded successfully");
  }, []);

  const loadFields = async () => {
    try {
      setLoading(true);
      console.log("📊 [ManageFieldsPage] Loading fields");
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const { data, error } = await supabase
        .from('fields')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setFields(data || []);
      console.log(`✅ [ManageFieldsPage] Loaded ${data?.length || 0} fields`);
    } catch (error: any) {
      console.error("❌ [ManageFieldsPage] Failed to load fields:", error.message);
      toast.error("Failed to load fields", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const loadFarms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setFarms(data || []);
    } catch (error: any) {
      console.error("❌ [ManageFieldsPage] Failed to load farms:", error.message);
    }
  };

  const handleFieldAdded = (field: Field) => {
    console.log("✅ [ManageFieldsPage] Field added:", field.name);
    setFields(prev => [field, ...prev]);
    setAddDialogOpen(false);
    toast.success("Field added successfully", {
      description: `${field.name} has been added to your farm.`
    });
  };

  return (
    <Layout>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Fields</h1>
          <Button onClick={() => setAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Field
          </Button>
        </div>

        {/* Fields management UI will go here */}
        <div className="grid grid-cols-1 gap-4">
          {fields.map(field => (
            <Card key={field.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {field.name}
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Size: {field.size} {field.size_unit}</p>
                {field.soil_type && <p>Soil: {field.soil_type}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Field</DialogTitle>
            </DialogHeader>
            <AddFieldForm 
              farms={farms}
              onSuccess={handleFieldAdded} 
              onCancel={() => setAddDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ManageFields;
