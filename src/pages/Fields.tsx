
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AddFieldForm from "@/components/fields/AddFieldForm";
import { Field } from "@/types/field";
import { toast } from "sonner";
import { useErrorLogging } from '@/hooks/use-error-logging';
import { Link } from 'react-router-dom';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import { FieldSelectCallback } from '@/components/fields/types';

const Fields = () => {
  const { logError, logSuccess } = useErrorLogging('FieldsPage');
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [farms, setFarms] = useState<any[]>([]);

  useEffect(() => {
    loadFields();
    loadFarms();
    console.log("✅ [FieldsPage] loaded successfully");
  }, []);

  const loadFields = async () => {
    try {
      setLoading(true);
      console.log("📊 [FieldsPage] Loading fields");
      
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
      console.log(`✅ [FieldsPage] Loaded ${data?.length || 0} fields`);
    } catch (error: any) {
      console.error("❌ [FieldsPage] Failed to load fields:", error.message);
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
      console.error("❌ [FieldsPage] Failed to load farms:", error.message);
    }
  };

  const handleFieldAdded = (field: Field) => {
    try {
      console.log("✅ [FieldsPage] Field added:", field.name);
      setFields(prev => [field, ...prev]);
      setAddDialogOpen(false);
      toast.success("Field added successfully", {
        description: `${field.name} has been added to your farm.`
      });
      logSuccess('field_added', { field_id: field.id, field_name: field.name });
    } catch (error: any) {
      logError(error, { operation: 'handleFieldAdded' });
    }
  };

  return (
    <Layout>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Your Fields</h1>
          <Button onClick={() => setAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Field
          </Button>
        </div>

        {/* Fields list will go here */}
        <ErrorBoundary>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map(field => (
              <Card key={field.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{field.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Size: {field.size} {field.size_unit}</p>
                  {field.soil_type && <p>Soil: {field.soil_type}</p>}
                  <div className="mt-4">
                    <Link to={`/fields/${field.id}`}>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ErrorBoundary>
        
        {fields.length === 0 && !loading && (
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">You haven't added any fields yet.</p>
            <Button onClick={() => setAddDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Your First Field
            </Button>
          </div>
        )}

        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Field</DialogTitle>
            </DialogHeader>
            <ErrorBoundary>
              <AddFieldForm 
                farms={farms}
                onSuccess={handleFieldAdded} 
                onCancel={() => setAddDialogOpen(false)} 
              />
            </ErrorBoundary>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Fields;
