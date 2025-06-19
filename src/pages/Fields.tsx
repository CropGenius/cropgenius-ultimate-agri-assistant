
import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from "@/services/supabaseClient";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MapPin } from "lucide-react";
import { Field } from "@/types/field";
import { Link } from 'react-router-dom';
import { useErrorLogging } from '@/hooks/use-error-logging';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import { motion } from 'framer-motion';
import AddFieldWizardButton from "@/components/fields/AddFieldWizardButton";

const Fields = () => {
  const { logError, logSuccess } = useErrorLogging('FieldsPage');
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFields();
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

  const handleFieldAdded = (field: Field) => {
    try {
      console.log("✅ [FieldsPage] Field added:", field.name);
      setFields(prev => [field, ...prev]);
      toast.success("Field added successfully", {
        description: `${field.name} has been added to your farm.`
      });
      logSuccess('field_added', { field_id: field.id, field_name: field.name });
    } catch (error: any) {
      logError(error, { operation: 'handleFieldAdded' });
    }
  };

  // Animation variants for list items
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
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <Layout>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Your Fields</h1>
          <AddFieldWizardButton 
            onFieldAdded={handleFieldAdded}
            className="relative"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Field
          </AddFieldWizardButton>
        </div>

        {/* Fields list with animations */}
        <ErrorBoundary>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="opacity-40">
                  <CardHeader>
                    <div className="h-7 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-5 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse"></div>
                    <div className="h-9 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {fields.map(field => (
                <motion.div
                  key={field.id}
                  variants={item}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <Card className="hover:shadow-md transition-all hover:-translate-y-1 duration-300 border">
                    <CardHeader>
                      <CardTitle className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                        <span>{field.name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-3 text-muted-foreground">
                        <p>Size: {field.size} {field.size_unit}</p>
                        {field.soil_type && <p>Soil: {field.soil_type}</p>}
                      </div>
                      <div>
                        <Link to={`/fields/${field.id}`}>
                          <Button variant="outline" size="sm" className="w-full">View Details</Button>
                        </Link>
                      </div>
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
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground mb-6">You haven't added any fields yet.</p>
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ 
                repeat: 3,
                repeatType: "reverse",
                duration: 0.8 
              }}
            >
              <AddFieldWizardButton
                onFieldAdded={handleFieldAdded}
                buttonText="Add Your First Field"
                icon={<PlusCircle className="mr-2 h-4 w-4" />}
              />
            </motion.div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Fields;
