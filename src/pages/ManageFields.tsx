
import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Edit, Map, ArrowLeft } from "lucide-react";
import { Field } from "@/types/field";
import { useErrorLogging } from '@/hooks/use-error-logging';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AddFieldWizardButton from "@/components/fields/AddFieldWizardButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ManageFields = () => {
  const { logError, logSuccess, trackOperation } = useErrorLogging('ManageFieldsPage');
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    loadFields();
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

  const handleFieldAdded = (field: Field) => {
    try {
      console.log("✅ [ManageFieldsPage] Field added:", field.name);
      setFields(prev => [field, ...prev]);
      toast.success("Field added successfully", {
        description: `${field.name} has been added to your farm.`
      });
      logSuccess('field_added', { field_id: field.id });
    } catch (error: any) {
      logError(error, { operation: 'handleFieldAdded' });
    }
  };
  
  const handleDeleteField = trackOperation('deleteField', async (fieldId: string) => {
    try {
      const { error } = await supabase
        .from('fields')
        .delete()
        .eq('id', fieldId);
        
      if (error) throw error;
      
      setFields(prevFields => prevFields.filter(f => f.id !== fieldId));
      toast.success("Field deleted successfully");
    } catch (error: any) {
      console.error("Error deleting field:", error);
      toast.error("Failed to delete field", { description: error.message });
    } finally {
      setDeleteTarget(null);
    }
  });

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Layout>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Fields</h1>
          <AddFieldWizardButton 
            onFieldAdded={handleFieldAdded}
            size="sm"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Field
          </AddFieldWizardButton>
        </div>
        
        <div className="mb-6">
          <Link to="/fields">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Fields
            </Button>
          </Link>
        </div>

        <ErrorBoundary>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="opacity-40">
                  <CardHeader>
                    <div className="h-7 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-5 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 gap-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {fields.map(field => (
                <motion.div
                  key={field.id}
                  variants={item}
                  transition={{ type: "spring" }}
                >
                  <Card className="hover:shadow-sm transition-all border">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span className="flex items-center">
                          <Map className="h-4 w-4 mr-2 text-primary" />
                          {field.name}
                        </span>
                        <div className="flex gap-2">
                          <Link to={`/fields/${field.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </Link>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => setDeleteTarget(field.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Size: {field.size} {field.size_unit}</p>
                      {field.soil_type && <p>Soil: {field.soil_type}</p>}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </ErrorBoundary>
        
        {fields.length === 0 && !loading && (
          <motion.div
            className="text-center py-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mx-auto w-16 h-16 mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <Map className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground mb-6">You haven't added any fields yet.</p>
            <AddFieldWizardButton 
              onFieldAdded={handleFieldAdded}
              buttonText="Add Your First Field"
            />
          </motion.div>
        )}
      </div>
      
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your field
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteTarget && handleDeleteField(deleteTarget)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default ManageFields;
