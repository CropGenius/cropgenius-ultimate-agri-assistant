
// Update the handleFieldAdded function to accept a parameter
const handleFieldAdded = (field: Field) => {
  setFields(prev => [field, ...prev]);
  setAddDialogOpen(false);
  toast.success("Field added successfully", {
    description: `${field.name} has been added to your farm.`
  });
};

// And where the AddFieldForm is used:
<AddFieldForm 
  farms={farms}
  onSuccess={() => {
    // Load fields again or close dialog
    setAddDialogOpen(false);
  }} 
  onCancel={() => setAddDialogOpen(false)} 
/>
