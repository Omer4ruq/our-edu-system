import React, { useState, useEffect } from 'react';
import { useGetLayoutNamesQuery } from '../../redux/features/api/layout/layoutNamesApi';
import { useGetLayoutModelsByNameIdQuery } from '../../redux/features/api/layout/layoutModelsApi';
import { useBulkUpdateLayoutsMutation, useCreateLayoutMutation, useGetLayoutsQuery } from '../../redux/features/api/layout/layoutsApi';


const LayoutModel = () => {
  const [selectedLayoutNameId, setSelectedLayoutNameId] = useState(null);
  const [selectedLayoutModel, setSelectedLayoutModel] = useState(null);

  // Fetch layout names for tabs
  const { 
    data: layoutNames = [], 
    isLoading: layoutNamesLoading 
  } = useGetLayoutNamesQuery();

  // Fetch layout models based on selected layout name
  const { 
    data: layoutModels = [], 
    isLoading: layoutModelsLoading,
    refetch: refetchLayoutModels 
  } = useGetLayoutModelsByNameIdQuery(selectedLayoutNameId, {
    skip: !selectedLayoutNameId
  });

  // Fetch existing layouts to check is_active status
  const { 
    data: existingLayouts = [], 
    isLoading: existingLayoutsLoading,
    refetch: refetchExistingLayouts
  } = useGetLayoutsQuery();

  // Mutations
  const [createLayout] = useCreateLayoutMutation();
  const [bulkUpdateLayouts] = useBulkUpdateLayoutsMutation();

  // Set first layout name as selected when data loads
  useEffect(() => {
    if (layoutNames.length > 0 && !selectedLayoutNameId) {
      setSelectedLayoutNameId(layoutNames[0].id);
    }
  }, [layoutNames, selectedLayoutNameId]);

  // Find active layout model from existing layouts (filtered by current selectedLayoutNameId)
  const getActiveLayoutModel = () => {
    const matchingLayouts = existingLayouts.filter(layout => 
      layout.layout_model.layout_name_id === selectedLayoutNameId
    );
    const activeLayout = matchingLayouts.find(layout => layout.is_active === true);
    return activeLayout ? activeLayout.layout_model.id : null;
  };

  // Handle layout model selection
  const handleLayoutModelSelect = async (layoutModel) => {
    setSelectedLayoutModel(layoutModel.id);
    
    try {
      // Filter existing layouts that match the current selectedLayoutNameId
      const matchingExistingLayouts = existingLayouts.filter(layout => 
        layout.layout_model.layout_name_id === selectedLayoutNameId
      );
      
      const hasExistingData = matchingExistingLayouts.length > 0;
      
      if (hasExistingData) {
        // Update only matching existing layouts - set selected one to active, others to inactive
        const updateData = matchingExistingLayouts.map(layout => ({
          id: layout.id,
          layout_id: layout.layout_model.id,
          is_active: layout.layout_model.id === layoutModel.id
        }));
        
        await bulkUpdateLayouts(updateData).unwrap();
      } else {
        // Create new layouts only for current layoutModels - only selected one is active
        const createData = layoutModels.map(model => ({
          layout_id: model.id,
          is_active: model.id === layoutModel.id
        }));
        
        await createLayout(createData).unwrap();
      }
      
      // Refetch data to update UI
      refetchExistingLayouts();
    } catch (error) {
      console.error('Error updating layouts:', error);
    }
  };

  // Handle tab selection
  const handleTabSelect = (layoutNameId) => {
    setSelectedLayoutNameId(layoutNameId);
    setSelectedLayoutModel(null);
  };

  if (layoutNamesLoading) {
    return <div className="flex justify-center p-4">Loading layout names...</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Tabs for Layout Names */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {layoutNames.map((layoutName) => (
              <button
                key={layoutName.id}
                onClick={() => handleTabSelect(layoutName.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedLayoutNameId === layoutName.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {layoutName.layout_name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Layout Models Grid */}
      {selectedLayoutNameId && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Select Layout Model
          </h3>
          
          {layoutModelsLoading ? (
            <div className="flex justify-center p-8">
              <div className="text-gray-500">Loading layout models...</div>
            </div>
          ) : layoutModels.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              No layout models found for this layout name.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {layoutModels.map((layoutModel) => {
                const isSelected = getActiveLayoutModel() === layoutModel.id || selectedLayoutModel === layoutModel.id;
                
                return (
                  <div
                    key={layoutModel.id}
                    className={`relative cursor-pointer rounded-lg border-2 overflow-hidden transition-all duration-200 ${
                      isSelected 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleLayoutModelSelect(layoutModel)}
                  >
                    {/* Layout Image */}
                    <div className="aspect-w-16 aspect-h-10">
                      <img
                        src={layoutModel.layout_image}
                        alt={`Layout ${layoutModel.layout_model}`}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                        }}
                      />
                    </div>
                    
                    {/* Layout Info */}
                    <div className="p-3 bg-white">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          Model {layoutModel.layout_model}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          layoutModel.is_landscape 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {layoutModel.is_landscape ? 'Landscape' : 'Portrait'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg 
                          className="w-4 h-4 text-white" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M5 13l4 4L19 7" 
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LayoutModel;