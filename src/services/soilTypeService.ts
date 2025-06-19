
import { supabase } from "@/services/supabaseClient";
import { SoilType } from "@/types/field";

// Get all soil types
export const getSoilTypes = async (): Promise<{data: SoilType[], error: string | null}> => {
  try {
    const { data, error } = await supabase
      .from('soil_types')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error("Error fetching soil types:", error);
    return { 
      data: [
        // Fallback soil types if database fetch fails
        {
          id: "clay",
          name: "Clay",
          description: "Heavy, dense soil that retains water well",
          properties: {
            texture: "fine",
            ph_level: 7.2,
            drainage: "poor",
            organic_matter: 1.5
          }
        },
        {
          id: "sandy",
          name: "Sandy",
          description: "Light, well-drained soil that warms quickly",
          properties: {
            texture: "coarse",
            ph_level: 6.5,
            drainage: "excellent",
            organic_matter: 0.5
          }
        },
        {
          id: "loam",
          name: "Loam",
          description: "Balanced soil with good structure and drainage",
          properties: {
            texture: "medium",
            ph_level: 6.8,
            drainage: "good",
            organic_matter: 3.0
          }
        }
      ], 
      error: error.message 
    };
  }
};

// Get soil type by ID
export const getSoilTypeById = async (id: string): Promise<{data: SoilType | null, error: string | null}> => {
  try {
    const { data, error } = await supabase
      .from('soil_types')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error("Error fetching soil type:", error);
    return { data: null, error: error.message };
  }
};

// Get soil type by name
export const getSoilTypeByName = async (name: string): Promise<{data: SoilType | null, error: string | null}> => {
  try {
    const { data, error } = await supabase
      .from('soil_types')
      .select('*')
      .eq('name', name)
      .single();
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error: any) {
    console.error("Error fetching soil type:", error);
    return { data: null, error: error.message };
  }
};
