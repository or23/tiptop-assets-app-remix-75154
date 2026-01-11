
import { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, SelectedAsset, Opportunity } from "@/types/analysis";
import { LogIn } from 'lucide-react';
import iconMap from './IconMap';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AssetFormSectionProps {
  selectedAssets: SelectedAsset[];
  opportunities: Opportunity[];
  onComplete: (formData: Record<string, Record<string, string | number>>) => void;
  onFieldChange?: (assetTitle: string, fieldName: string, value: string | number) => void;
}

const AssetFormSection = ({ 
  selectedAssets,
  opportunities,
  onComplete
  ,onFieldChange
}: AssetFormSectionProps) => {
  const [formData, setFormData] = useState<Record<string, Record<string, string | number>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  console.log('📝 AssetFormSection received:', {
    selectedAssetsCount: selectedAssets.length,
    selectedAssets: selectedAssets.map(a => ({ title: a.title, revenue: a.monthlyRevenue })),
    opportunitiesCount: opportunities.length
  });

  // Merge parent-provided formData (if any) into local state.
  // Local edits always win over incoming values to avoid wiping user input.
  useEffect(() => {
    setFormData((prev) => {
      let changed = false;
      const next = { ...prev };

      selectedAssets.forEach((asset) => {
        if (!asset.formData) return;
        const existing = next[asset.title] || {};
        const merged = { ...asset.formData, ...existing };
        if (merged !== existing) {
          next[asset.title] = merged;
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [selectedAssets]);

  // Memoize form fields lookup to prevent unnecessary recalculations
  const formFieldsMap = useMemo(() => {
    const map = new Map<string, FormField[]>();
    
    opportunities.forEach(opp => {
      if (opp.formFields) {
        map.set(opp.title, opp.formFields);
      }
    });
    
    return map;
  }, [opportunities]);

  // Find form fields for an asset based on its title
  const findFormFields = (assetTitle: string): FormField[] => {
    const fields = formFieldsMap.get(assetTitle) || [];
    console.log(`🔍 Form fields for ${assetTitle}:`, fields);
    return fields;
  };

  const handleInputChange = useCallback((assetTitle: string, fieldName: string, value: string | number) => {
    console.log(`📝 Input changed for ${assetTitle}.${fieldName}:`, value);
    setFormData(prev => ({
      ...prev,
      [assetTitle]: {
        ...(prev[assetTitle] || {}),
        [fieldName]: value
      }
    }));

    onFieldChange?.(assetTitle, fieldName, value);
  }, [onFieldChange]);

  const getFieldValue = useCallback((assetTitle: string, field: FormField): string | number => {
    const fromState = formData?.[assetTitle]?.[field.name];
    if (fromState !== undefined && fromState !== null && fromState !== '') return fromState;
    return field.value ?? '';
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('📤🚀 FORM SUBMIT TRIGGERED - Form data submitted:', formData);
      
      // Show success toast
      toast({
        title: "Information Saved",
        description: "Your asset information has been saved successfully."
      });
      
      // Call onComplete to save to database and handle navigation
      setTimeout(() => {
        setIsSubmitting(false);
        console.log('📤🚀 CALLING onComplete() to trigger database save');
        onComplete(formData);
      }, 500);
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      setIsSubmitting(false);
      
      toast({
        title: "Submission Error",
        description: "There was a problem saving your information. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Early return for no assets case
  if (!selectedAssets || selectedAssets.length === 0) {
    console.warn('⚠️ No selected assets provided to AssetFormSection');
    return (
      <div className="mt-8 mb-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">No Assets Selected</h2>
        <p className="text-gray-300">Please go back and select assets to continue.</p>
      </div>
    );
  }

  console.log('🎨 Rendering form for assets:', selectedAssets.map(a => a.title));

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center px-3 sm:px-4 md:px-6">
      {/* Content positioned at the top of the container */}
      <div className="w-full mt-4 sm:mt-6 md:mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl mx-auto"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 drop-shadow-lg text-center">
            Additional Information Needed
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {selectedAssets.map((asset, index) => {
              console.log(`🎯 Rendering asset ${index + 1}/${selectedAssets.length}:`, asset.title);
              
              const formFields = findFormFields(asset.title);
              const iconType = asset.icon as keyof typeof iconMap;
              
              return (
                <div 
                  key={asset.title}
                  className="glass-effect p-6 rounded-lg relative overflow-hidden"
                  style={{
                    background: `linear-gradient(to bottom right, rgba(155, 135, 245, 0.2), rgba(155, 135, 245, 0.1))`,
                    boxShadow: '0 4px 15px rgba(155, 135, 245, 0.2)'
                  }}
                >
                  <div className="mb-4 flex items-center gap-4">
                    <div className="w-12 h-12 glass-effect flex items-center justify-center rounded-lg">
                      {iconMap[iconType] || (
                        <span className="text-white text-lg">{asset.title.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{asset.title}</h3>
                      <p className="text-gray-300">${asset.monthlyRevenue}/month</p>
                      {asset.provider && (
                        <p className="text-gray-400 text-sm">via {asset.provider}</p>
                      )}
                    </div>
                  </div>
                  
                  {formFields.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {formFields.map((field, fieldIndex) => {
                        console.log(`🔧 Rendering field ${fieldIndex + 1}/${formFields.length} for ${asset.title}:`, field.name);
                        const value = getFieldValue(asset.title, field);
                        
                        return (
                          <div key={`${asset.title}-${field.name}`} className="form-field">
                            <Label htmlFor={`${asset.title}-${field.name}`} className="text-white mb-1 block">
                              {field.label}
                            </Label>
                            
                            {field.type === "select" ? (
                              <Select 
                                value={String(value ?? '')}
                                onValueChange={(value) => handleInputChange(asset.title, field.name, value)}
                              >
                                <SelectTrigger className="glass-effect border-white/20 text-white">
                                  <SelectValue placeholder={String(field.value ?? '')} />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.options?.map(option => (
                                    <SelectItem key={option} value={option}>{option}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                id={`${asset.title}-${field.name}`}
                                type={field.type} 
                                value={field.type === "number" ? (value === undefined || value === null ? '' : String(value)) : String(value ?? '')}
                                onChange={(e) => {
                                  const value = field.type === "number" 
                                    ? parseFloat(e.target.value) 
                                    : e.target.value;
                                  handleInputChange(asset.title, field.name, value);
                                }}
                                className="glass-effect border-white/20 text-white"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-2 text-gray-200 italic">
                      No additional information needed for this asset.
                    </div>
                  )}
                  
                  {/* Enhanced glossy effect */}
                  <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent rounded-t-lg pointer-events-none"></div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 rounded-lg pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black/10 to-transparent rounded-b-lg pointer-events-none"></div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-xl blur-lg -z-10 pointer-events-none"></div>
                </div>
              );
            })}
            
            <div className="flex justify-center mt-8">
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="glass-effect bg-gradient-to-r from-tiptop-purple to-purple-600 hover:opacity-90 px-8 py-6 rounded-full flex items-center gap-3 text-xl transition-all"
                style={{ 
                  boxShadow: '0 0 20px rgba(155, 135, 245, 0.5)',
                }}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-pulse">Processing...</span>
                    <div className="h-5 w-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin"></div>
                  </>
                ) : (
                  <>
                    <span>Complete & Authenticate</span>
                    <LogIn size={24} />
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AssetFormSection;
